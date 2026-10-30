// Same alpha-masked PNG as shop-client (public/assets/KS_logo.png), so it
// inherits currentColor and stays correct in both light and dark mode.
const markStyle = (size: number): React.CSSProperties => ({
  display: "inline-block",
  width: size,
  height: size,
  backgroundColor: "currentColor",
  WebkitMaskImage: "url(/assets/KS_logo.png)",
  maskImage: "url(/assets/KS_logo.png)",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskSize: "contain",
  maskSize: "contain",
});

export const Logo = ({ size = 36 }: { size?: number }) => (
  <span aria-hidden style={markStyle(size)} />
);
