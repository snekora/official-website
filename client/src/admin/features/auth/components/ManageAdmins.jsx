import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerAdmin,
  fetchAdmins,
  removeAdmin,
} from "../redux/adminAuthSlice";
import { toast } from "react-toastify";
import {
  UserPlus,
  Key,
  User,
  Lock,
  ShieldCheck,
  Loader2,
  Trash2,
  ShieldAlert,
  Search,
} from "lucide-react";
import ConfirmDeleteModal from "../modal/ConfirmDeleteModal";
import ConfirmCreateAdminModal from "../modal/ConfirmCreateAdminModal";

const ManageAdmins = () => {
  const dispatch = useDispatch();
  const {
    adminsList,
    admin: currentAdmin,
    loading: reduxLoading,
  } = useSelector((state) => state.adminAuth);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    secret: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowCreateModal(true);
  };

  const handleConfirmCreate = async () => {
    setIsSubmitting(true);

    try {
      await dispatch(
        registerAdmin({
          username: formData.username,
          password: formData.password,
          secret: formData.secret,
        }),
      ).unwrap();

      toast.success(`Admin "${formData.username}" created successfully!`);
      setFormData({ username: "", password: "", secret: "" });
      setShowCreateModal(false);
      dispatch(fetchAdmins());
    } catch (error) {
      toast.error(error || "Failed to create admin.");
      setShowCreateModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (admin) => {
    setDeleteTarget(admin);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget._id);
    try {
      await dispatch(removeAdmin(deleteTarget._id)).unwrap();
      toast.success(`Admin "${deleteTarget.username}" deleted successfully.`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error || "Failed to delete admin.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAdmins = useMemo(() => {
    return adminsList.filter((admin) =>
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [adminsList, searchTerm]);

  return (
    <div className="min-h-[calc(100dvh-72px)] bg-[#0c0c0d] text-white px-4 sm:px-6 lg:px-8 py-8">
      {" "}
      <div className="mx-auto max-w-7xl">
        {/* Header */}{" "}
        <div className="mb-6 border-b border-white/10 pb-5">
          {" "}
          <div className="flex items-center gap-3">
            {" "}
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10">
              {" "}
              <ShieldCheck size={18} className="text-lime-400" />{" "}
            </div>{" "}
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
                Manage Admins
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Create or remove administrator accounts.
              </p>
            </div>{" "}
          </div>{" "}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          {/* Left: Form */}
          <div className="rounded-2xl border border-white/10 bg-[#111113] p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={16} className="text-lime-400" />
              <h2 className="text-sm font-semibold">New Admin</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
                  Username
                </label>
                <div className="relative">
                  <User
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                    className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 pl-9 pr-3.5 text-xs outline-none placeholder:text-zinc-600 focus:border-lime-400/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 pl-9 pr-3.5 text-xs outline-none placeholder:text-zinc-600 focus:border-lime-400/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-wider text-zinc-400">
                  Secret Key
                </label>
                <div className="relative">
                  <Key
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    type="password"
                    name="secret"
                    required
                    value={formData.secret}
                    onChange={handleChange}
                    placeholder="Registration secret"
                    className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2.5 pl-9 pr-3.5 text-xs outline-none placeholder:text-zinc-600 focus:border-lime-400/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime-400 px-3.5 py-2.5 text-xs font-semibold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus size={15} />
                Create Admin
              </button>
            </form>
          </div>

          {/* Right: List */}
          <div className="rounded-2xl border border-white/10 bg-[#111113] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-lime-400" />
                <h2 className="text-sm font-semibold">
                  Active Administrators
                </h2>
              </div>

              <div className="relative w-full sm:w-64">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search admin"
                  className="w-full rounded-xl border border-white/10 bg-[#0c0c0d] py-2 pl-9 pr-3.5 text-xs outline-none placeholder:text-zinc-600 focus:border-lime-400/50"
                />
              </div>
            </div>

            {reduxLoading && adminsList.length === 0 ? (
              <div className="flex min-h-[320px] items-center justify-center text-zinc-500">
                <div className="text-center">
                  <Loader2
                    size={24}
                    className="mx-auto mb-3 animate-spin text-lime-400"
                  />
                  <p className="text-xs">Loading administrators...</p>
                </div>
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-white/10 text-zinc-500">
                <p className="text-xs">
                  {searchTerm
                    ? "No matching administrators found."
                    : "No administrators found."}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full border-collapse text-left">
                    <thead className="bg-white/[0.03]">
                      <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-zinc-500">
                        <th className="px-5 py-3 font-medium">Username</th>
                        <th className="px-5 py-3 font-medium">Created At</th>
                        <th className="px-5 py-3 font-medium text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdmins.map((admin) => {
                        const isCurrent = admin._id === currentAdmin?._id;

                        return (
                          <tr
                            key={admin._id}
                            className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition"
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-lime-400/10 text-xs font-bold uppercase text-lime-400">
                                  {admin.username.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-xs font-medium">
                                    {admin.username}
                                  </p>
                                  {isCurrent && (
                                    <span className="mt-0.5 inline-block text-[10px] text-lime-400">
                                      You
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-xs text-zinc-400">
                              {admin.createdAt
                                ? new Date(admin.createdAt).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              {!isCurrent ? (
                                <button
                                  onClick={() => handleOpenDeleteModal(admin)}
                                  disabled={deletingId === admin._id}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {deletingId === admin._id ? (
                                    <Loader2
                                      size={13}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2 size={13} />
                                  )}
                                  Delete
                                </button>
                              ) : (
                                <span className="text-xs text-zinc-500">
                                  Current account
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile List */}
                <div className="grid gap-3 md:hidden">
                  {filteredAdmins.map((admin) => {
                    const isCurrent = admin._id === currentAdmin?._id;

                    return (
                      <div
                        key={admin._id}
                        className="rounded-xl border border-white/10 bg-[#111113] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-400/10 text-xs font-bold uppercase text-lime-400">
                              {admin.username.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {admin.username}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {admin.createdAt
                                  ? new Date(
                                      admin.createdAt,
                                    ).toLocaleDateString()
                                  : "-"}
                              </p>
                            </div>
                          </div>

                          {!isCurrent ? (
                            <button
                              onClick={() => handleOpenDeleteModal(admin)}
                              disabled={deletingId === admin._id}
                              className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === admin._id ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          ) : (
                            <div className="flex items-center text-[10px] uppercase tracking-wider text-lime-400 font-medium self-center">
                              Current account
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ConfirmCreateAdminModal
        isOpen={showCreateModal}
        onClose={() => !isSubmitting && setShowCreateModal(false)}
        onConfirm={handleConfirmCreate}
        adminData={formData}
        isSubmitting={isSubmitting}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => !deletingId && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        adminName={deleteTarget?.username || ""}
        isDeleting={!!deletingId}
      />
    </div>
  );
};

export default ManageAdmins;
