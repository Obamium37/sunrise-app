const ChevronIcon = ({ size, rotation }) => {
    const rotationVariants = {
        90: "rotate-90",
        180: "rotate-180",
        270: "-rotate-90",
    };
  
    return (
        <svg viewBox="0 0 24 24" className={`transform ${rotationVariants[rotation]}`} xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
            <path d="M19 17H17V16H16V15H15V14H14V13H13V12H11V13H10V14H9V15H8V16H7V17H5V16H4V14H5V13H6V12H7V11H8V10H9V9H10V8H11V7H13V8H14V9H15V10H16V11H17V12H18V13H19V14H20V16H19V17Z" className="outlined" />
        </svg>

    );
};

export default ChevronIcon;