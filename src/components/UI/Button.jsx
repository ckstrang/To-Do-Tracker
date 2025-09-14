const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-gray-100 font-semibold 
               py-2 rounded-md transition m-1"
  >
    {children}
  </button>
);

export default Button;
