    type CustomerFormProps = {
  name: string;
  email: string;
  status: string;
  notes: string;
  nextAction: string;
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setStatus: (value: string) => void;
  setNotes: (value: string) => void;
  setNextAction: (value: string) => void;
  addCustomer: () => void;
};

export default function CustomerForm({
  name,
  email,
  status,
  notes,
  nextAction,
  setName,
  setEmail,
  setStatus,
  setNotes,
  setNextAction,
  addCustomer,
}: CustomerFormProps) {
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
      }}
    >
      <h2 style={{ margin: 0, fontSize: "20px" }}>Add Customer</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
      />
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
      >
        <option value="new">New</option>
        <option value="contacted">Contacted</option>
        <option value="quoted">Quoted</option>
        <option value="won">Won</option>
        <option value="lost">Lost</option>
      </select>
      <input
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
      />
      <input
        placeholder="Next action"
        value={nextAction}
        onChange={(e) => setNextAction(e.target.value)}
        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
      />
      <button
        onClick={addCustomer}
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: "1px solid #222",
          backgroundColor: "#222",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Add Customer
      </button>
    </div>
  );
}