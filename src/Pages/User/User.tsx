import { useQuery } from "@tanstack/react-query";
import { Input, type SortDescriptor } from "@heroui/react";
import { IoGridSharp } from "react-icons/io5";
import { useCallback, useEffect, useMemo, useState } from "react";

import SelectBox from "../../Components/SelectBox/SelectBox";
import Loading from "../../Components/Loading/Loading";
import Pagination from "../../Components/Pagination/Pagination";

import DataGrid, {
  type IDataGridColumn,
  type SelectionMode,
} from "../../Components/DataGrid/DataGrid";

import { getUsers } from "../../utils/api";
import { getCompanies } from "../../utils/GetAllCompines";
import { getCities } from "../../utils/GetAllCities";
import { sortItems } from "../../utils/SortItems";

import type { IUser } from "../../types/IUser";

/*
 Debounce hook
 */
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};




const contains = (value: string | undefined, query: string) =>
  query === "" || (value ?? "").toLowerCase().includes(query);

const getUserId = (user: IUser) => user.id;
const getUserLabel = (user: IUser) => `Select ${user.name}`;

const SELECTION_MODES = ["single", "multiple", "all"];

const userColumns: IDataGridColumn<IUser>[] = [
  { key: "id", label: "ID", sortable: true, isRowHeader: true, sortValue: (u) => u.id },
  { key: "name", label: "Name", sortable: true, sortValue: (u) => u.name },
  { key: "username", label: "Username", sortable: true, sortValue: (u) => u.username },
  { key: "email", label: "Email", sortable: true, sortValue: (u) => u.email },
  { key: "phone", label: "Phone", sortable: true, sortValue: (u) => u.phone },
  { key: "website", label: "Website", sortable: true, sortValue: (u) => u.website },
  {
    key: "company",
    label: "Company",
    sortable: true,
    sortValue: (u) => u.company.name,
    render: (u) => u.company.name,
  },
  {
    key: "city",
    label: "City",
    sortable: true,
    sortValue: (u) => u.address.city,
    render: (u) => u.address.city,
  },
];

const User = () => {
  /* Fetch users */
  const { isLoading, error, data } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  /* Search */
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  /* Column filters */
  const [nameFilter, setNameFilter] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [websiteFilter, setWebsiteFilter] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  /* Selection */
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("single");

  /* Sorting */
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });

  /* Pagination */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* Select options */
  const companies = useMemo(() => (data ? getCompanies(data) : []), [data]);
  const cities = useMemo(() => (data ? getCities(data) : []), [data]);

  /* Filtering */
  const filteredUsers = useMemo(() => {
    if (!data) return [];

    const searchValue = debouncedSearch.toLocaleLowerCase().trim();
    const nameValue =nameFilter.toLocaleLowerCase().trim();
    const usernameValue = usernameFilter.toLocaleLowerCase().trim();
    const emailValue = emailFilter.toLocaleLowerCase().trim();
    const websiteValue = websiteFilter.toLocaleLowerCase().trim();

    return data.filter((user) => {
      const matchesSearch =
        searchValue === "" ||
        contains(user.name, searchValue) ||
        contains(user.username, searchValue) ||
        contains(user.email, searchValue) ||
        contains(user.phone, searchValue) ||
        contains(user.website, searchValue);

      return (
        matchesSearch &&
        contains(user.name, nameValue) &&
        contains(user.username, usernameValue) &&
        contains(user.email, emailValue) &&
        contains(user.website, websiteValue) &&
        (selectedCompany === "" ||
          selectedCompany === "All" ||
          user.company.name === selectedCompany) &&
        (selectedCity === "" ||
          selectedCity === "All" ||
          user.address.city === selectedCity)
      );
    });
  }, [
    data,
    debouncedSearch,
    nameFilter,
    usernameFilter,
    emailFilter,
    websiteFilter,
    selectedCompany,
    selectedCity,
  ]);

  const sortedUsers = useMemo(() => {
    const column = userColumns.find((col) => col.key === sortDescriptor.column);

    if (!column?.sortValue) return filteredUsers;

    return sortItems(filteredUsers, column.sortValue, sortDescriptor.direction);
  }, [filteredUsers, sortDescriptor]);

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));

  const currentPage = Math.min(page, totalPages);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedUsers.slice(startIndex, startIndex + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  // Back to page 1 when filters or page size change.
  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    nameFilter,
    usernameFilter,
    emailFilter,
    websiteFilter,
    selectedCompany,
    selectedCity,
    pageSize,
  ]);

  const startItem =
    sortedUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, sortedUsers.length);

  const handleSelectionModeChange = useCallback((value: string) => {
    setSelectionMode(value as SelectionMode);
  }, []);

  const handleCompanyChange = useCallback((value: string) => {
    setSelectedCompany(value);
  }, []);

  const handleCityChange = useCallback((value: string) => {
    setSelectedCity(value);
  }, []);

  const handleSortChange = useCallback((descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--main-color) px-4">
        <div className="rounded-2xl border border-danger-200 bg-danger-50 px-6 py-5 text-center">
          <h2 className="font-semibold text-danger">Failed to load users</h2>
          <p className="mt-1 text-sm text-danger-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const filterFields = [
    { id: "name-filter", label: "Name", value: nameFilter, set: setNameFilter },
    { id: "username-filter", label: "Username", value: usernameFilter, set: setUsernameFilter },
    { id: "email-filter", label: "Email", value: emailFilter, set: setEmailFilter },
    { id: "website-filter", label: "Website", value: websiteFilter, set: setWebsiteFilter },
  ];

  return (
    <div className="min-h-screen bg-(--main-color)">
      <div className="container mx-auto px-4 py-6 lg:px-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10">
              <IoGridSharp className="text-cyan-500" size={25} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                Users Data Grid
              </h1>
              <p className="mt-1 text-sm text-default-500">
                Manage and filter users data
              </p>
            </div>
          </div>

          {/* Selection Mode */}
          <div className="w-full sm:w-48">
            <SelectBox
              name="Selection Mode"
              items={SELECTION_MODES}
              showAll={false}
              value={selectionMode}
              onChange={handleSelectionModeChange}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-default-200/60 bg-default-50/50 p-4 shadow-sm sm:p-5">
          {/* Global Search */}
          <div className="mb-5">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search users"
              placeholder="Search by name, username, email, phone or website..."
              className="w-full"
            />
          </div>

          {/* Column Filters */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filterFields.map((field) => (
              <div key={field.id} className="flex items-center gap-3">
                <label
                  htmlFor={field.id}
                  className="w-20 shrink-0 text-sm font-medium text-foreground"
                >
                  {field.label}
                </label>

                <Input
                  id={field.id}
                  value={field.value}
                  onChange={(event) => field.set(event.target.value)}
                  placeholder={`Filter by ${field.label.toLowerCase()}...`}
                  className="flex-1"
                />
              </div>
            ))}

            <SelectBox
              name="Company"
              items={companies}
              value={selectedCompany}
              onChange={handleCompanyChange}
            />

            <SelectBox
              name="City"
              items={cities}
              value={selectedCity}
              onChange={handleCityChange}
            />
          </div>
        </div>

        {/* Results */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Users</h2>

          <span className="text-sm text-default-500">
            {sortedUsers.length} {sortedUsers.length === 1 ? "user" : "users"}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-default-200/60 bg-background shadow-sm">
          <DataGrid<IUser>
            data={paginatedUsers}
            columns={userColumns}
            getRowId={getUserId}
            getRowLabel={getUserLabel}
            selectionMode={selectionMode}
            sortDescriptor={sortDescriptor}
            onSortChange={handleSortChange}
            emptyMessage={
              data?.length === 0
                ? "No users available."
                : "No users match the current filters."
            }
          />

          <Pagination
            page={currentPage}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            totalItems={sortedUsers.length}
            startItem={startItem}
            endItem={endItem}
          />
        </div>
      </div>
    </div>
  );
};

export default User;
