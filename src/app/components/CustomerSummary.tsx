type CustomerSummaryProps = {
  totalCount: number;
  newCount: number;
  contactedCount: number;
  quotedCount: number;
  wonCount: number;
  lostCount: number;
};

export default function CustomerSummary({
  totalCount,
  newCount,
  contactedCount,
  quotedCount,
  wonCount,
  lostCount,
}: CustomerSummaryProps) {
  const boxStyle = {
    padding: "16px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#fff",
    color: "#000",
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(120px, 1fr))",
        gap: "12px",
        maxWidth: "700px",
        marginBottom: "24px",
      }}
    >
      <div style={boxStyle}>
        <strong>Total</strong>
        <p style={{ margin: "8px 0 0 0" }}>{totalCount}</p>
      </div>
      <div style={boxStyle}>
        <strong>New</strong>
        <p style={{ margin: "8px 0 0 0" }}>{newCount}</p>
      </div>
      <div style={boxStyle}>
        <strong>Contacted</strong>
        <p style={{ margin: "8px 0 0 0" }}>{contactedCount}</p>
      </div>
      <div style={boxStyle}>
        <strong>Quoted</strong>
        <p style={{ margin: "8px 0 0 0" }}>{quotedCount}</p>
      </div>
      <div style={boxStyle}>
        <strong>Won</strong>
        <p style={{ margin: "8px 0 0 0" }}>{wonCount}</p>
      </div>
      <div style={boxStyle}>
        <strong>Lost</strong>
        <p style={{ margin: "8px 0 0 0" }}>{lostCount}</p>
      </div>
    </div>
  );
}