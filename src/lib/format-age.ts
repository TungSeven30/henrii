/**
 * Compute a baby's age from date of birth and return a translation key
 * with interpolation values for next-intl.
 *
 * Buckets:
 *  - Under 28 days  -> "X days old"
 *  - Under 12 months -> "X months, Y weeks"
 *  - 12 months+      -> "X years, Y months"
 */
export function formatBabyAge(dob: string): {
  key: string;
  values: Record<string, number>;
} {
  const birthDate = new Date(dob);
  const now = new Date();

  const diffMs = now.getTime() - birthDate.getTime();
  const totalDays = Math.floor(diffMs / 86_400_000);

  if (totalDays < 28) {
    return { key: "ageDays", values: { days: totalDays } };
  }

  // Calculate months difference using calendar math (more accurate than dividing days)
  let months =
    (now.getFullYear() - birthDate.getFullYear()) * 12 +
    (now.getMonth() - birthDate.getMonth());

  // If we haven't reached the birth day-of-month yet this month, subtract one month
  if (now.getDate() < birthDate.getDate()) {
    months -= 1;
  }

  if (months < 12) {
    // Find the date that is `months` months after birth
    const monthsAgoDate = new Date(birthDate);
    monthsAgoDate.setMonth(monthsAgoDate.getMonth() + months);
    const remainingDays = Math.floor(
      (now.getTime() - monthsAgoDate.getTime()) / 86_400_000
    );
    const weeks = Math.floor(remainingDays / 7);

    return { key: "ageMonthsWeeks", values: { months, weeks } };
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  return { key: "ageYearsMonths", values: { years, months: remainingMonths } };
}
