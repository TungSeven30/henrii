"use client";

import { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { format, isPast, isFuture, differenceInDays } from "date-fns";
import {
  Calendar,
  MapPin,
  Paperclip,
  Plus,
  Trash2,
  FileText,
  ClipboardList,
  Baby,
  Moon,
  Droplets,
  Weight,
  Syringe,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AppointmentAttachment {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string | null;
  size_bytes: number;
  uploaded_by: string;
}

interface Appointment {
  id: string;
  baby_id: string;
  created_by: string;
  client_uuid: string | null;
  title: string;
  scheduled_at: string;
  location: string | null;
  notes: string | null;
  reminder_hours_before: number;
  status: "scheduled" | "completed" | "cancelled";
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
  appointment_attachments: AppointmentAttachment[] | null;
}

interface PrepData {
  feedCount: number;
  sleepCount: number;
  diaperCount: number;
  daysCovered: number;
  weightStart: number | null;
  weightEnd: number | null;
  percentileStart: number | null;
  percentileEnd: number | null;
  vaccinesCompleted: string[];
  milestonesAchieved: string[];
}

interface AppointmentsContentProps {
  babyId: string;
  userId: string;
  babyDateOfBirth?: string | null;
  premium: boolean;
  canWrite?: boolean;
  appointments: Appointment[];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function toDatetimeLocalValue(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatAttachmentType(file: AppointmentAttachment) {
  const explicit = file.mime_type?.split("/").pop();
  return explicit || file.file_name.split(".").pop() || "file";
}

export function AppointmentsContent({
  babyId,
  userId,
  babyDateOfBirth,
  premium,
  canWrite = true,
  appointments,
}: AppointmentsContentProps) {
  const t = useTranslations("appointments");
  const router = useRouter();

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");

  const upcoming = appointments.filter((a) => isFuture(new Date(a.scheduled_at)));
  const past = appointments.filter((a) => isPast(new Date(a.scheduled_at)));

  function openCreateForm() {
    if (!canWrite) {
      toast.error(t("noWritePermission"));
      return;
    }
    setEditingAppointment(null);
    setTitle("");
    setLocation("");
    setScheduledAt("");
    setNotes("");
    setFormOpen(true);
  }

  function openEditForm(appointment: Appointment) {
    if (!canWrite) {
      toast.error(t("noWritePermission"));
      return;
    }
    setEditingAppointment(appointment);
    setTitle(appointment.title);
    setLocation(appointment.location ?? "");
    setScheduledAt(toDatetimeLocalValue(appointment.scheduled_at));
    setNotes(appointment.notes ?? "");
    setFormOpen(true);
  }

  function openDetail(appointment: Appointment) {
    setSelectedAppointment(appointment);
    setDetailOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canWrite || !title.trim() || !scheduledAt) {
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const parsedDate = new Date(scheduledAt);

    if (Number.isNaN(parsedDate.getTime())) {
      toast.error(t("invalidDatetime"));
      setSaving(false);
      return;
    }

    const payload = {
      title: title.trim(),
      location: location.trim() || null,
      scheduled_at: parsedDate.toISOString(),
      notes: notes.trim() || null,
    };

    if (editingAppointment) {
      const { error } = await supabase
        .from("appointments")
        .update(payload)
        .eq("id", editingAppointment.id);

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("appointments").insert({
        ...payload,
        baby_id: babyId,
        created_by: userId,
        client_uuid: crypto.randomUUID(),
      });

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setFormOpen(false);
    router.refresh();
  }

  const handleNotesBlur = useCallback(
    async (appointmentId: string, notesValue: string) => {
      if (!canWrite || savingNotes) {
        return;
      }
      setSavingNotes(true);
      const supabase = createClient();
      const { error } = await supabase
        .from("appointments")
        .update({ notes: notesValue || null })
        .eq("id", appointmentId);

      if (error) {
        toast.error(error.message);
      } else {
        router.refresh();
      }
      setSavingNotes(false);
    },
    [canWrite, router, savingNotes],
  );

  async function handleFileUpload(appointmentId: string, file: File) {
    if (!canWrite) {
      toast.error(t("noWritePermission"));
      return;
    }
    if (!premium) {
      toast.error(t("attachmentsPremiumOnly"));
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/appointments/${appointmentId}/attachments`, {
        method: "POST",
        body: formData,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error((body as { error?: string }).error ?? t("uploadFailed"));
      }
      setFileInputValue("");
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("uploadFailed"));
      }
    } finally {
      setUploading(false);
    }
  }

  function setFileInputValue(value: string) {
    if (fileInputRef.current) {
      fileInputRef.current.value = value;
    }
  }

  async function handleDeleteAttachment(attachment: AppointmentAttachment) {
    if (!canWrite) {
      toast.error(t("noWritePermission"));
      return;
    }

    const supabase = createClient();
    const removeResult = await supabase.storage
      .from("appointment-attachments")
      .remove([attachment.file_path]);
    if (removeResult.error) {
      toast.error(removeResult.error.message);
      return;
    }

    const { error: dbError } = await supabase
      .from("appointment_attachments")
      .delete()
      .eq("id", attachment.id);

    if (dbError) {
      toast.error(dbError.message);
      return;
    }

    router.refresh();
  }

  async function handleDeleteAppointment(appointmentId: string) {
    if (!canWrite) {
      toast.error(t("noWritePermission"));
      return;
    }

    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("appointments").delete().eq("id", appointmentId);

    if (error) {
      toast.error(error.message);
      setDeleting(false);
      return;
    }

    setDeleting(false);
    setDetailOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-henrii-amber/20">
            <Calendar className="size-5 text-henrii-amber" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold">{t("title")}</h2>
            <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
        <Button size="sm" onClick={openCreateForm} disabled={!canWrite}>
          <Plus className="size-4" />
          {t("add")}
        </Button>
      </div>

      {!canWrite ? (
        <p className="text-xs text-amber-600 flex items-center gap-1.5">
          <AlertCircle className="size-3.5" />
          {t("readOnly")}
        </p>
      ) : null}

      {appointments.length === 0 ? (
        <Card className="py-8">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center justify-center size-12 rounded-full bg-muted">
              <Calendar className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">{t("noAppointments")}</p>
            <p className="text-xs text-muted-foreground">
              {t("noAppointmentsSubtitle")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {t("upcoming")}
              </h3>
              {upcoming.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  t={t}
                  onClick={() => openDetail(appointment)}
                  onEdit={() => openEditForm(appointment)}
                />
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {t("past")}
              </h3>
              {past.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  t={t}
                  onClick={() => openDetail(appointment)}
                  onEdit={() => openEditForm(appointment)}
                  isPast
                />
              ))}
            </section>
          )}
        </>
      )}

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingAppointment ? t("edit") : t("add")}
            </SheetTitle>
            <SheetDescription>
              {editingAppointment ? editingAppointment.title : t("noAppointmentsSubtitle")}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("appointmentTitle")} *</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t("location")}</Label>
              <Input
                id="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder={t("locationPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledAt">{t("scheduledAt")} *</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("notes")}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t("notesPlaceholder")}
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setFormOpen(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {t("save")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          {selectedAppointment && (
            <>
              <SheetHeader>
                <SheetTitle>{t("details")}</SheetTitle>
                <SheetDescription>{selectedAppointment.title}</SheetDescription>
              </SheetHeader>

              <div className="space-y-4 px-4 pb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="size-4 text-henrii-amber" />
                    <span>{format(new Date(selectedAppointment.scheduled_at), "PPP 'at' p")}</span>
                  </div>

                  {selectedAppointment.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="size-4 text-muted-foreground" />
                      <span>{selectedAppointment.location}</span>
                    </div>
                  )}

                  {selectedAppointment.notes && (
                    <div className="text-sm">
                      <span className="font-medium">{t("notes")}:</span> {selectedAppointment.notes}
                    </div>
                  )}
                </div>

                {isFuture(new Date(selectedAppointment.scheduled_at)) ? (
                  <VisitPrepCard
                    babyId={babyId}
                    babyDateOfBirth={babyDateOfBirth}
                    appointment={selectedAppointment}
                    allAppointments={appointments}
                    t={t}
                  />
                ) : null}

                <div className="space-y-2">
                  <Label>{t("postVisitNotes")}</Label>
                  <Textarea
                    defaultValue={selectedAppointment.notes ?? ""}
                    placeholder={t("postVisitNotesPlaceholder")}
                    rows={3}
                    disabled={!canWrite}
                    onBlur={(event) =>
                      handleNotesBlur(selectedAppointment.id, event.target.value)
                    }
                  />
                  {savingNotes ? <p className="text-xs text-muted-foreground">{t("saving")}</p> : null}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>{t("attachments")}</Label>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || !canWrite || !premium}
                    >
                      <Paperclip className="size-3" />
                      {t("uploadFile")}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          handleFileUpload(selectedAppointment.id, file);
                          event.target.value = "";
                        }
                      }}
                    />
                  </div>

                  {(selectedAppointment.appointment_attachments?.length ?? 0) === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {t("noAttachments")}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedAppointment.appointment_attachments?.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between rounded-md border px-3 py-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="size-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <a
                                href={`/api/appointments/attachments/${attachment.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium truncate block hover:underline"
                              >
                                {attachment.file_name}
                              </a>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-[10px]">
                                  {formatAttachmentType(attachment)}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {formatFileSize(attachment.size_bytes)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="icon-xs"
                            variant="ghost"
                            disabled={!canWrite}
                            onClick={() => handleDeleteAttachment(attachment)}
                          >
                            <Trash2 className="size-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setDetailOpen(false);
                      openEditForm(selectedAppointment);
                    }}
                  >
                    {t("edit")}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={deleting || !canWrite}>
                        <Trash2 className="size-4" />
                        {t("delete")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmDeleteTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("confirmDelete")}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                        >
                          {t("delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function VisitPrepCard({
  babyId,
  babyDateOfBirth,
  appointment,
  allAppointments,
  t,
}: {
  babyId: string;
  babyDateOfBirth?: string | null;
  appointment: Appointment;
  allAppointments: Appointment[];
  t: ReturnType<typeof useTranslations<"appointments">>;
}) {
  const [prepData, setPrepData] = useState<PrepData | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function fetchPrepData() {
    if (prepData) {
      setExpanded(!expanded);
      return;
    }

    setLoading(true);
    setExpanded(true);

    try {
      const supabase = createClient();

      const pastAppointments = allAppointments
        .filter(
          (item) =>
            item.id !== appointment.id &&
            isPast(new Date(item.scheduled_at)) &&
            new Date(item.scheduled_at) < new Date(appointment.scheduled_at),
        )
        .sort(
          (left, right) =>
            new Date(right.scheduled_at).getTime() -
            new Date(left.scheduled_at).getTime(),
        );

      const lastAppointment = pastAppointments[0] ?? null;
      const sinceDate = lastAppointment
        ? new Date(lastAppointment.scheduled_at).toISOString()
        : babyDateOfBirth
          ? new Date(babyDateOfBirth).toISOString()
          : new Date(0).toISOString();
      const now = new Date().toISOString();

      const [
        feedingsRes,
        sleepRes,
        diapersRes,
        growthRes,
        vaccinesRes,
        milestonesRes,
      ] = await Promise.all([
        supabase
          .from("feedings")
          .select("id", { count: "exact", head: true })
          .eq("baby_id", babyId)
          .gte("started_at", sinceDate)
          .lte("started_at", now),
        supabase
          .from("sleep_sessions")
          .select("id", { count: "exact", head: true })
          .eq("baby_id", babyId)
          .gte("started_at", sinceDate)
          .lte("started_at", now),
        supabase
          .from("diaper_changes")
          .select("id", { count: "exact", head: true })
          .eq("baby_id", babyId)
          .gte("changed_at", sinceDate)
          .lte("changed_at", now),
        supabase
          .from("growth_measurements")
          .select("weight_kg, weight_percentile, measured_at")
          .eq("baby_id", babyId)
          .gte("measured_at", sinceDate)
          .order("measured_at", { ascending: true }),
        supabase
          .from("vaccinations")
          .select("vaccine_name, completed_at")
          .eq("baby_id", babyId)
          .eq("status", "completed")
          .gte("completed_at", sinceDate),
        supabase
          .from("developmental_milestones")
          .select("milestone_key")
          .eq("baby_id", babyId)
          .eq("status", "achieved")
          .gte("achieved_at", sinceDate),
      ]);

      const feedCount = feedingsRes.count ?? 0;
      const sleepCount = sleepRes.count ?? 0;
      const diaperCount = diapersRes.count ?? 0;

      const growthData = growthRes.data ?? [];
      const firstWeightRaw = growthData.find((measurement) => {
        const kilos = measurement.weight_kg;
        return Number(kilos) > 0;
      });
      const lastWeightRaw = [...growthData]
        .reverse()
        .find((measurement) => {
          const kilos = measurement.weight_kg;
          return Number(kilos) > 0;
        });

      const weightStart = firstWeightRaw
        ? Number(firstWeightRaw.weight_kg) * 1000
        : null;
      const weightEnd = lastWeightRaw
        ? Number(lastWeightRaw.weight_kg) * 1000
        : null;

      setPrepData({
        feedCount,
        sleepCount,
        diaperCount,
        daysCovered: Math.max(1, differenceInDays(new Date(), new Date(sinceDate))),
        weightStart: Number.isFinite(weightStart) ? weightStart : null,
        weightEnd: Number.isFinite(weightEnd) ? weightEnd : null,
        percentileStart: Number(firstWeightRaw?.weight_percentile) || null,
        percentileEnd: Number(lastWeightRaw?.weight_percentile) || null,
        vaccinesCompleted: (vaccinesRes.data ?? []).map((entry) => entry.vaccine_name),
        milestonesAchieved: (milestonesRes.data ?? []).map((entry) => entry.milestone_key),
      });
    } finally {
      setLoading(false);
    }
  }

  const hasData =
    prepData &&
    (prepData.feedCount > 0 ||
      prepData.sleepCount > 0 ||
      prepData.diaperCount > 0 ||
      prepData.weightEnd !== null ||
      prepData.vaccinesCompleted.length > 0 ||
      prepData.milestonesAchieved.length > 0);

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={fetchPrepData}
        disabled={loading}
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <ClipboardList className="size-4" />}
        {loading ? t("prepLoading") : t("prepareForVisit")}
      </Button>

      {expanded && prepData && (
        <Card className="border-henrii-amber/30 bg-henrii-amber/5">
          <CardContent className="space-y-3 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">
              {prepData.daysCovered > 30 ? t("sinceBirth") : t("sinceLast")} ({prepData.daysCovered}
              d)
            </p>

            {!hasData ? (
              <p className="text-sm text-muted-foreground">{t("noDataYet")}</p>
            ) : (
              <div className="space-y-2">
                {(prepData.feedCount > 0 ||
                  prepData.sleepCount > 0 ||
                  prepData.diaperCount > 0) && (
                  <div className="grid grid-cols-3 gap-2">
                    <PrepStat
                      icon={<Baby className="size-3.5 text-henrii-rose" />}
                      label={t("feedingSummary")}
                      value={prepData.feedCount}
                      avg={(prepData.feedCount / prepData.daysCovered).toFixed(1)}
                      avgLabel={t("avgPerDay")}
                    />
                    <PrepStat
                      icon={<Moon className="size-3.5 text-henrii-indigo" />}
                      label={t("sleepSummary")}
                      value={prepData.sleepCount}
                      avg={(prepData.sleepCount / prepData.daysCovered).toFixed(1)}
                      avgLabel={t("avgPerDay")}
                    />
                    <PrepStat
                      icon={<Droplets className="size-3.5 text-henrii-teal" />}
                      label={t("diaperSummary")}
                      value={prepData.diaperCount}
                      avg={(prepData.diaperCount / prepData.daysCovered).toFixed(1)}
                      avgLabel={t("avgPerDay")}
                    />
                  </div>
                )}

                {prepData.weightStart !== null &&
                  prepData.weightEnd !== null &&
                  prepData.weightStart !== prepData.weightEnd && (
                    <div className="flex items-center gap-2 text-sm">
                      <Weight className="size-3.5 text-henrii-amber" />
                      <span className="font-medium">{t("weightChange")}:</span>
                      <span>
                        {prepData.weightEnd - prepData.weightStart > 0 ? "+" : ""}
                        {((prepData.weightEnd - prepData.weightStart) / 1000).toFixed(2)} {t("grams")}
                      </span>
                      {prepData.percentileStart !== null && prepData.percentileEnd !== null && (
                        <Badge variant="secondary" className="text-[10px]">
                          {t("percentileShift")}: {prepData.percentileStart.toFixed(0)} →{" "}
                          {prepData.percentileEnd.toFixed(0)}
                        </Badge>
                      )}
                    </div>
                  )}

                {prepData.vaccinesCompleted.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Syringe className="size-3.5 text-henrii-green" />
                      {t("vaccinesCompleted")} ({prepData.vaccinesCompleted.length})
                    </div>
                    <div className="flex flex-wrap gap-1 pl-5">
                      {prepData.vaccinesCompleted.map((name) => (
                        <Badge key={name} variant="secondary" className="text-[10px]">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {prepData.milestonesAchieved.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Star className="size-3.5 text-henrii-amber" />
                      {t("milestonesAchieved")} ({prepData.milestonesAchieved.length})
                    </div>
                    <div className="flex flex-wrap gap-1 pl-5">
                      {prepData.milestonesAchieved.map((key) => (
                        <Badge key={key} variant="secondary" className="text-[10px]">
                          {key.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PrepStat({
  icon,
  label,
  value,
  avg,
  avgLabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  avg: string;
  avgLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border p-2 text-center">
      {icon}
      <span className="text-lg font-bold tabular-nums">{value}</span>
      <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
      <span className="text-[10px] text-muted-foreground">
        {avg} {avgLabel}
      </span>
    </div>
  );
}

function AppointmentCard({
  appointment,
  t,
  onClick,
  onEdit,
  isPast: isPastAppointment,
}: {
  appointment: Appointment;
  t: ReturnType<typeof useTranslations<"appointments">>;
  onClick: () => void;
  onEdit: () => void;
  isPast?: boolean;
}) {
  const attachmentCount = appointment.appointment_attachments?.length ?? 0;

  return (
    <Card
      className="py-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="space-y-2 px-4">
        <div className="flex items-start justify-between">
          <h4 className="font-semibold text-sm">{appointment.title}</h4>
          <div className="flex items-center gap-1.5 shrink-0">
            {attachmentCount > 0 && (
              <Badge variant="outline" className="text-[10px]">
                <Paperclip className="size-2.5" />
                {attachmentCount}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="size-3 text-henrii-amber" />
          <span>{format(new Date(appointment.scheduled_at), "PPP 'at' p")}</span>
        </div>

        {appointment.location && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            <span>{appointment.location}</span>
          </div>
        )}

        {isPastAppointment && appointment.notes && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {appointment.notes}
          </p>
        )}

        <div className="flex justify-end pt-1">
          <Button size="xs" variant="ghost" onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}>
            {t("edit")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
