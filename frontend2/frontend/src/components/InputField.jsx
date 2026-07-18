function InputField({
  type,
  placeholder,
  value,
  onChange,
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="
      w-full
      glass-input
      rounded-2xl
      p-4
      text-white
      placeholder-secondary-text
      focus:outline-none"
    />
  );
}

export default InputField;