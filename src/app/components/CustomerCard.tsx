type Customer = {
  id: number;
  name: string;
  email: string | null;
  status: string | null;
  notes: string | null;
  updated_at: string | null;
  next_action: string | null;
};

type CustomerCardProps = {
  customer: Customer;
  updateStatus: (id: number, newStatus: string) => void;
  updateNotes: (id: number, newNotes: string) => void;
  updateNextAction: (id: number, newNextAction: string) => void;
  deleteCustomer: (id: number) => void;
};

export default function CustomerCard({
  customer,
  updateStatus,
  updateNotes,
  updateNextAction,
  deleteCustomer,
}: CustomerCardProps) {
  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #ccc",
        borderRadius: "12px",
        backgroundColor: "#fff",
        color: "#000",
      }}
    >
      <h3 style={{ margin: 0 }}>{customer.name}</h3>
      <p style={{ margin: "8px 0 0 0" }}>
        Email: {customer.email || "No email"}
      </p>

      <div style={{ marginTop: "8px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          Status
        </label>
        <select
          value={customer.status || "new"}
          onChange={(e) => updateStatus(customer.id, e.target.value)}
          style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="quoted">Quoted</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      <div style={{ marginTop: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          Notes
        </label>
        <textarea
          defaultValue={customer.notes || ""}
          rows={3}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
          onBlur={(e) => updateNotes(customer.id, e.target.value)}
        />
      </div>

      <div style={{ marginTop: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px" }}>
          Next action
        </label>
        <input
          defaultValue={customer.next_action || ""}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
          onBlur={(e) => updateNextAction(customer.id, e.target.value)}
        />
      </div>

      <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>
        Last updated:{" "}
        {customer.updated_at
          ? new Date(customer.updated_at).toLocaleString()
          : "Not available"}
      </p>

      <button
        onClick={() => deleteCustomer(customer.id)}
        style={{
          marginTop: "12px",
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid #b00020",
          backgroundColor: "#b00020",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Delete
      </button>
    </div>
  );
}