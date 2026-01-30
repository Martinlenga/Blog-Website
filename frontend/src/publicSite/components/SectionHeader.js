const SectionHeader = ({ title, subtitle }) => {
  return (
    <header className="mb-10">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-gray-600 text-base max-w-xl">
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default SectionHeader;
