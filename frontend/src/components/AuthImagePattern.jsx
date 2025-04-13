import { useThemeStore } from "../store/useThemeStore";

const AuthImagePattern = ({ title, subtitle }) => {
   const {theme} = useThemeStore();
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-16">
      <div className="max-w-sm text-center">
        {/* <div className="grid grid-cols-3 gap-3 mb-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-primary/10 ${
                i % 2 === 0 ? "animate-pulse" : ""
              }`}
            />
          ))}
        </div> */}
        <img src={theme == "dark"? "/chatgifdark.gif":"/chatgiflight.gif"}/>
        <h2 className="text-2xl font-bold my-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
