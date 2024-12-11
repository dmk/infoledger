export type AnchorFn = (hash: string) => Promise<string>;
export type VerifyFn = (proof: string) => Promise<boolean>;

export type Anchor = {
  anchor: AnchorFn;
  verify: VerifyFn;
};

export const createAnchor = (
  anchorFn: AnchorFn,
  verifyFn: VerifyFn
): Anchor => ({
  anchor: anchorFn,
  verify: verifyFn
});
