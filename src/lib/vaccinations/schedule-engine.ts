import { promises as fs } from "node:fs";
import path from "node:path";

type ScheduleRow = {
  code: string;
  name: string;
  ageDays: number;
};

type VaccinationInsert = {
  vaccine_code: string;
  vaccine_name: string;
  due_date: string;
};

function getScheduleFileName(countryCode: string) {
  if (countryCode === "GB") {
    return "nhs.json";
  }

  if (countryCode === "VN") {
    return "vn-nepi.json";
  }

  return "cdc.json";
}

export async function loadVaccinationSchedule(countryCode: string): Promise<ScheduleRow[]> {
  const fileName = getScheduleFileName(countryCode);
  const schedulePath = path.join(process.cwd(), "data", "vaccinations", fileName);
  const raw = await fs.readFile(schedulePath, "utf8");
  return JSON.parse(raw) as ScheduleRow[];
}

export async function buildVaccinationDueRows(
  countryCode: string,
  dateOfBirth: string,
): Promise<VaccinationInsert[]> {
  const baseDate = new Date(dateOfBirth);
  const schedule = await loadVaccinationSchedule(countryCode);

  return schedule.map((entry) => {
    const dueDate = new Date(baseDate.getTime() + entry.ageDays * 24 * 60 * 60 * 1000);

    return {
      vaccine_code: entry.code,
      vaccine_name: entry.name,
      due_date: dueDate.toISOString().slice(0, 10),
    };
  });
}
