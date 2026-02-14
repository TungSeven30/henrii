"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useBabyStore } from "@/stores/baby-store";
import { useRouter } from "@/i18n/navigation";
import { populateVaccinesAction } from "@/app/actions/populate-vaccines";
import { PhotoUpload } from "@/components/baby/photo-upload";
import type { PhotoUploadHandle } from "@/components/baby/photo-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/types/database";

type BabyRow = Database["public"]["Tables"]["babies"]["Row"];

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "VN", name: "Vietnam" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "NZ", name: "New Zealand" },
  { code: "IN", name: "India" },
  { code: "PH", name: "Philippines" },
  { code: "TH", name: "Thailand" },
] as const;

const COMMON_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Ho_Chi_Minh",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Singapore",
  "Asia/Kolkata",
  "Asia/Manila",
  "Asia/Bangkok",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
] as const;

const babyFormSchema = z.object({
  name: z.string().min(1, "Required"),
  date_of_birth: z.string().min(1, "Required"),
  sex: z.enum(["male", "female"]).optional(),
  country_code: z.string().min(1, "Required"),
  timezone: z.string().min(1, "Required"),
});

type BabyFormValues = z.infer<typeof babyFormSchema>;

interface BabyFormProps {
  baby?: BabyRow;
}

export function BabyForm({ baby }: BabyFormProps) {
  const t = useTranslations("onboarding");
  const tCommon = useTranslations("common");
  const tBaby = useTranslations("baby");
  const router = useRouter();
  const setActiveBaby = useBabyStore((s) => s.setActiveBaby);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const photoRef = useRef<PhotoUploadHandle>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(baby?.photo_url ?? null);

  const detectedTimezone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "America/New_York";

  const form = useForm<BabyFormValues>({
    resolver: zodResolver(babyFormSchema),
    defaultValues: {
      name: baby?.name ?? "",
      date_of_birth: baby?.date_of_birth ?? "",
      sex: baby?.sex ?? "male",
      country_code: baby?.country_code ?? "",
      timezone: baby?.timezone ?? detectedTimezone,
    },
  });

  useEffect(() => {
    if (!baby && !form.getValues("timezone")) {
      form.setValue("timezone", detectedTimezone);
    }
  }, [baby, detectedTimezone, form]);

  async function onSubmit(values: BabyFormValues) {
    setIsSubmitting(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      const payload = {
        name: values.name,
        date_of_birth: values.date_of_birth,
        sex: values.sex || "male",
        country_code: values.country_code,
        timezone: values.timezone,
        photo_url: photoUrl,
      };

      if (baby) {
        const { data, error } = await supabase
          .from("babies")
          .update(payload)
          .eq("id", baby.id)
          .select()
          .single();

        if (error) throw error;

        setActiveBaby({
          id: data.id,
          name: data.name,
          date_of_birth: data.date_of_birth,
          sex: data.sex,
          country_code: data.country_code,
          timezone: data.timezone,
          photo_url: data.photo_url,
          owner_id: data.owner_id,
        });

        toast.success(tBaby("updated"));
        router.push("/dashboard");
      } else {
        const { data, error } = await supabase
          .from("babies")
          .insert({ ...payload, owner_id: user.id })
          .select()
          .single();

        if (error) throw error;

        // Upload any pending photo now that we have a baby ID
        let newPhotoUrl: string | null = data.photo_url;
        const pendingUrl = await photoRef.current?.uploadPending(data.id);
        if (pendingUrl) {
          newPhotoUrl = pendingUrl;
          await supabase
            .from("babies")
            .update({ photo_url: pendingUrl })
            .eq("id", data.id);
        }

        setActiveBaby({
          id: data.id,
          name: data.name,
          date_of_birth: data.date_of_birth,
          sex: data.sex,
          country_code: data.country_code,
          timezone: data.timezone,
          photo_url: newPhotoUrl,
          owner_id: data.owner_id,
        });

        // Fire-and-forget: populate vaccine schedule in the background
        populateVaccinesAction(
          data.id,
          data.date_of_birth,
          data.country_code ?? "US",
        ).catch(() => {
          // Vaccine population is best-effort at creation time.
          // The user can always re-trigger from the vaccinations page.
        });

        router.push("/dashboard");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePhotoUpload(url: string) {
    setPhotoUrl(url);
    if (baby) {
      const supabase = createClient();
      await supabase.from("babies").update({ photo_url: url }).eq("id", baby.id);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex justify-center pb-2">
          <PhotoUpload
            ref={photoRef}
            babyId={baby?.id ?? null}
            currentUrl={photoUrl}
            onUpload={handlePhotoUpload}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("babyName")}</FormLabel>
              <FormControl>
                <Input placeholder={t("babyNamePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("dateOfBirth")}</FormLabel>
              <FormControl>
                <Input type="date" max={new Date().toISOString().split("T")[0]} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("gender")}{" "}
                <span className="text-muted-foreground font-normal">
                  ({tCommon("optional")})
                </span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">{t("genderBoy")}</SelectItem>
                  <SelectItem value="female">{t("genderGirl")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("country")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("countryPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("timezone")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("timezonePlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COMMON_TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {baby ? tCommon("save") : t("createProfile")}
        </Button>
      </form>
    </Form>
  );
}
