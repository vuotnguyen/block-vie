import React, { FunctionComponent } from "react";
import { SvgProps } from "react-native-svg";
export type SvgSource = { default: React.FC<SvgProps> };
const SvgIcon = ({
  source: source,
  fill= "#fff",
  ...props
}: { source: FunctionComponent<SvgProps>, fill?: string } & SvgProps) => {
  const SvgImage = source;
  if (!SvgImage) {
    return null;
  }
  return <SvgImage fill={fill} {...props} />;
};
export default SvgIcon;
