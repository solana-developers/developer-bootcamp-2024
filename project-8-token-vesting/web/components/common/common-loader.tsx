const Loader = ({
  width,
  height,
  color,
}: {
  width: number;
  height: number;
  color: string;
}) => {
  return (
    <div className="w-full flex justify-center items-center">
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          borderColor: `${color}`,
        }}
        className="border-b rounded-full animate-spin"
      ></div>
    </div>
  );
};

export default Loader;
