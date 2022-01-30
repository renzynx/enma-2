export const Navigate = ({ route }: { route: string }) => {
  return <div>{(window.location.href = route)}</div>;
};
