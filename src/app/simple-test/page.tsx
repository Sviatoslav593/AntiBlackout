export default function SimpleTestPage() {
  return (
    <>
      <div
        style={{
          height: "100vh",
          backgroundColor: "red",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1>Section 1 - RED</h1>
      </div>
      <div
        style={{
          height: "100vh",
          backgroundColor: "green",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1>Section 2 - GREEN</h1>
      </div>
      <div
        style={{
          height: "100vh",
          backgroundColor: "blue",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1>Section 3 - BLUE</h1>
      </div>
    </>
  );
}
