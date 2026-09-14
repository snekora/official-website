const Address = require("./address.model");
const User = require("../users/user.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

// Add Address
const addAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const {
    name,
    phone,
    alternativePhone,
    line1,
    line2,
    city,
    state,
    pincode,
    type,
    isDefault,
  } = req.body;

  const addressCount = await Address.countDocuments({ userId });
  const shouldBeDefault =
    isDefault === true || isDefault === "true" || addressCount === 0;

  if (shouldBeDefault && addressCount > 0) {
    await Address.updateMany({ userId }, { $set: { isDefault: false } });
  }

  const address = await Address.create({
    userId,
    name,
    phone,
    alternativePhone,
    line1,
    line2,
    city,
    state,
    pincode,
    type,
    isDefault: shouldBeDefault,
  });

  await User.findByIdAndUpdate(userId, {
    $push: { addresses: address._id },
  });

  res.status(201).json(
    ApiResponse.success({ address }, "Address added successfully", 201)
  );
});

// Get All Addresses
const getAddresses = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const addresses = await Address.find({ userId }).sort({
    isDefault: -1,
    createdAt: -1,
  });

  res.status(200).json(
    ApiResponse.success({ addresses }, "Addresses fetched successfully")
  );
});

// Get Single Address
const getAddressById = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const address = await Address.findOne({
    _id: req.params.id,
    userId,
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  res.status(200).json(
    ApiResponse.success({ address }, "Address fetched successfully")
  );
});

// Update Address
const updateAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (req.body.isDefault === true || req.body.isDefault === "true") {
    await Address.updateMany({ userId }, { $set: { isDefault: false } });
    req.body.isDefault = true;
  } else if (req.body.isDefault === false || req.body.isDefault === "false") {
    req.body.isDefault = false;
  }

  const address = await Address.findOneAndUpdate(
    {
      _id: req.params.id,
      userId,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  res.status(200).json(
    ApiResponse.success({ address }, "Address updated successfully")
  );
});

// Delete Address
const deleteAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const address = await Address.findOneAndDelete({
    _id: req.params.id,
    userId,
  });

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  await User.findByIdAndUpdate(userId, {
    $pull: { addresses: address._id },
  });

  if (address.isDefault) {
    // If deleted address was default, make the most recent address default
    const latestAddress = await Address.findOne({ userId }).sort({
      createdAt: -1,
    });
    if (latestAddress) {
      latestAddress.isDefault = true;
      await latestAddress.save();
    }
  }

  res.status(200).json(
    ApiResponse.success(null, "Address deleted successfully")
  );
});

// Set Default Address
const setDefaultAddress = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await Address.updateMany({ userId }, { $set: { isDefault: false } });

  const address = await Address.findOneAndUpdate(
    {
      _id: req.params.id,
      userId,
    },
    {
      isDefault: true,
    },
    {
      new: true,
    }
  );

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  res.status(200).json(
    ApiResponse.success({ address }, "Default address updated")
  );
});

module.exports = {
  addAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
