import React from "react";

export default function PasswordStrengthHint({ password }) {
  const rules = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "Contains at least one letter",
      valid: /[a-zA-Z]/.test(password),
    },
    {
      label: "Contains at least one number",
      valid: /\d/.test(password),
    },
    {
      label: "Not a common or easily guessed password",
      valid: password.length >= 8 && !["password", "12345678"].includes(password.toLowerCase()),
    },
  ];

  return (
    <div className="mt-3 rounded-lg border bg-gray-50 p-3 text-sm">
      <p className="mb-2 font-medium text-gray-700">Password requirements:</p>
      <ul className="space-y-1">
        {rules.map((rule, index) => (
          <li
            key={index}
            className={`flex items-center gap-2 ${
              rule.valid ? "text-green-600" : "text-gray-400"
            }`}
          >
            <span>{rule.valid ? "✔" : "•"}</span>
            <span>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
