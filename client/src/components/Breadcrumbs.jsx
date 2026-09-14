import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home as HomeIcon } from "lucide-react";

/**
 * Reusable, professional Breadcrumbs component.
 *
 * @param {Object} props
 * @param {Array<{label: string, path?: string}>} [props.items] - Custom breadcrumb items.
 *        If omitted, items are automatically derived from the current URL pathname.
 * @param {string} [props.className] - Additional CSS classes.
 */
const Breadcrumbs = ({ items, className = "" }) => {
  const location = useLocation();

  let breadcrumbItems = items;

  // Auto-derive items from current path if items prop is not provided
  if (!breadcrumbItems) {
    const pathnames = location.pathname.split("/").filter(Boolean);
    breadcrumbItems = pathnames.map((value, index) => {
      const path = `/${pathnames.slice(0, index + 1).join("/")}`;
      const label =
        value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, " ");
      return {
        label,
        path: index === pathnames.length - 1 ? undefined : path,
      };
    });
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-zinc-400 text-xs sm:text-sm font-medium ${className}`}
    >
      <Link
        to="/"
        className="hover:text-white transition-colors flex items-center gap-1.5 group"
      >
        <HomeIcon
          size={14}
          className="text-zinc-500 group-hover:text-lime-400 transition-colors"
        />
        <span>Home</span>
      </Link>

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight size={13} className="text-zinc-600 shrink-0" />
            {isLast || !item.path ? (
              <span className="text-white font-semibold truncate max-w-[200px] sm:max-w-xs">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-white transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
