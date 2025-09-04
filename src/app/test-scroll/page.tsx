export default function TestScrollPage() {
  return (
    <div style={{ minHeight: "200vh", padding: "20px" }}>
      <h1>Test Scroll Page</h1>
      <div
        style={{
          height: "100vh",
          backgroundColor: "#f0f0f0",
          marginBottom: "20px",
        }}
      >
        <p>Section 1 - This should scroll on mobile</p>
      </div>
      <div
        style={{
          height: "100vh",
          backgroundColor: "#e0e0e0",
          marginBottom: "20px",
        }}
      >
        <p>Section 2 - If you can see this by scrolling, scroll works!</p>
      </div>
      <div style={{ height: "100vh", backgroundColor: "#d0d0d0" }}>
        <p>Section 3 - Bottom section</p>
      </div>
    </div>
  );
}
