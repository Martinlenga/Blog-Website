const SectionHeader = ({ title, subtitle, className = "" }) => {
  return (
    <header className={`mb-4 ${className}`}> {/* default mb-4, allow override */}
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-gray-600 text-base max-w-xl">
          {subtitle}
        </p>
      )}
    </header>
  );
};

export default SectionHeader;
