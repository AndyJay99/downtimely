type CustomerFiltersProps = {
  filter: string;
  search: string;
  setFilter: (value: string) => void;
  setSearch: (value: string) => void;
};

export default function CustomerFilters({
  filter,
  search,
  setFilter,
  setSearch,
}: CustomerFiltersProps) {
  return (
    <div
      style={{
        display: "grid",
        gap: "8px",
        maxWidth: "400px",
        marginBottom: "20px",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        backgroundColor: "#fafafa",
        color: "#000",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "20px" }}>Filters</h2>

      <label style={{ display: "block", marginBottom: "4px" }}>
        Filter by status
      </label>
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
      >
        <option value="all">All</option>
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="quoted">Quoted</option>
        <option value="won">Won</option>
        <option value="lost">Lost</option>
      </select>

      <label style={{ display: "block", marginBottom: "4px" }}>
        Search by name
      </label>
      <input
        placeholder="Search customers"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
      />
    </div>
  );
}