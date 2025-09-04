export default function RawTestPage() {
  return (
    <html>
      <head>
        <title>Raw Test</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body { margin: 0; padding: 0; overflow-y: scroll !important; -webkit-overflow-scrolling: touch !important; }
          .section { height: 100vh; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: white; }
          .red { background: red; }
          .green { background: green; }
          .blue { background: blue; }
        `}</style>
      </head>
      <body>
        <div className="section red">Section 1 - RED</div>
        <div className="section green">Section 2 - GREEN</div>
        <div className="section blue">Section 3 - BLUE</div>
      </body>
    </html>
  );
}
