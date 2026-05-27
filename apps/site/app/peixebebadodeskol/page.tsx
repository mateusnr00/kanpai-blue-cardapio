const VIDEO_SRC = "/PEIXESKOL.mp4";

export default function PeixeBebadoDeskolPage() {
  return (
    <main
      style={{
        margin: 0,
        minHeight: "100dvh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <video
        src={VIDEO_SRC}
        controls
        playsInline
        preload="metadata"
        style={{
          width: "100%",
          maxWidth: "100%",
          maxHeight: "100dvh",
          display: "block",
        }}
      />
    </main>
  );
}
