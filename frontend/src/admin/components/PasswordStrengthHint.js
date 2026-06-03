import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

export default function PasswordStrengthHint({ password = "" }) {
  // 🚀 SECURITY FIX: Replaced the weak "common password" check with a robust Special Character requirement
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
      label: "Contains a special character (!@#$%^&*)",
      valid: /[^a-zA-Z0-9]/.test(password),
    },
  ];

  // Calculate overall strength for the progress bar
  const validCount = rules.filter((r) => r.valid).length;
  const strengthPercent = (validCount / rules.length) * 100;

  // Dynamically color the bar based on completion
  let barColor = "bg-rose-500";
  if (validCount === rules.length) barColor = "bg-emerald-500";
  else if (validCount >= 2) barColor = "bg-amber-500";

  return (
    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-sm shadow-sm transition-all duration-300">
      
      {/* 🚀 UX OPTIMIZATION: Visual Strength Meter */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-semibold text-gray-700 text-[11px] uppercase tracking-wider">
            Password Strength
          </span>
          <span className="text-[11px] font-bold text-gray-500">
            {validCount}/{rules.length}
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${barColor}`}
            style={{ width: `${strengthPercent}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2.5">
        {rules.map((rule, index) => (
          <li
            key={index}
            className={`flex items-start gap-2.5 transition-colors duration-200 ${
              rule.valid ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            {/* Consistent Lucide Icons */}
            <div className="mt-0.5 shrink-0">
              {rule.valid ? (
                <CheckCircle2 size={16} className="text-emerald-500" />
              ) : (
                <Circle size={16} />
              )}
            </div>
            
            <span className={`text-sm ${rule.valid ? "font-medium" : ""}`}>
              {rule.label}
              {/* Screen reader accessibility */}
              <span className="sr-only">
                {rule.valid ? "Requirement met" : "Requirement not met"}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}