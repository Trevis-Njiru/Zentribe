"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { card, primaryButton } from "@/lib/styles";

type Professional = {
  id: string;
  full_name: string;
  professional_type: string | null;
  specializations: string[] | null;
  languages: string[] | null;
  session_types: string[] | null;
  availability: string[] | null;
  location: string | null;
  bio: string | null;
  verification_status: string | null;
};

export default function ProfessionalProfilePage() {
  const router = useRouter();
  const params = useParams();

  const professionalId = params?.id as string;

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [professional, setProfessional] =
    useState<Professional | null>(null);

  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    const loadProfessional = async () => {
      if (!professionalId) {
        setError("Professional profile not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: professionalError } =
        await supabase
          .from("professionals")
          .select("*")
          .eq("id", professionalId)
          .eq("verification_status", "approved")
          .maybeSingle();

      if (professionalError) {
        console.error(
          "Professional loading error:",
          professionalError
        );

        setError(
          "We could not load this professional's profile."
        );

        setLoading(false);
        return;
      }

      if (!data) {
        setError(
          "This professional profile is not available."
        );

        setLoading(false);
        return;
      }

      setProfessional(data as Professional);
      setLoading(false);
    };

    loadProfessional();
  }, [professionalId, supabase]);

  const requestSession = async () => {
    if (!professional) {
      return;
    }

    setRequesting(true);
    setError("");
    setSuccessMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "User error:",
          userError
        );

        setError(
          "We could not verify your account. Please log in again."
        );

        return;
      }

      if (!user) {
        router.push("/login");
        return;
      }

      const { error: requestError } =
        await supabase
          .from("session_requests")
          .insert({
            user_id: user.id,
            professional_id: professional.id,
            status: "pending",
          });

      if (requestError) {
        console.error(
          "Session request error:",
          requestError
        );

        const message =
          requestError.message.toLowerCase();

        if (
          message.includes("duplicate") ||
          message.includes("unique")
        ) {
          setError(
            "You already have a request with this professional."
          );
        } else if (
          message.includes("row-level security") ||
          message.includes("permission denied")
        ) {
          setError(
            "Your request was blocked by the database permissions. Please try again."
          );
        } else {
          setError(
            `We could not send your request: ${requestError.message}`
          );
        }

        return;
      }

      setRequestSent(true);

      setSuccessMessage(
        "Your session request has been sent successfully."
      );
    } catch (err) {
      console.error(
        "Unexpected request error:",
        err
      );

      setError(
        "Something went wrong while sending your request. Please try again."
      );
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className={card}>
            <p className="text-stone-600">
              Loading professional profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!professional) {
    return (
      <main className="min-h-screen bg-stone-50 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className={card}>
            <h1 className="text-xl font-semibold text-stone-900">
              Professional not available
            </h1>

            {error && (
              <p className="mt-3 text-stone-600">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => router.push("/matches")}
              className={`${primaryButton} mt-6`}
            >
              Back to Matches
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">

        <button
          type="button"
          onClick={() => router.push("/matches")}
          className="mb-6 text-sm font-medium text-teal-700 hover:text-teal-800"
        >
          ← Back to Matches
        </button>

        <div className={card}>

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

            <div className="flex-1">

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
                  {professional.full_name}
                </h1>

                {professional.professional_type && (
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
                    {professional.professional_type}
                  </span>
                )}

              </div>

              {professional.bio && (
                <p className="mt-5 leading-7 text-stone-600">
                  {professional.bio}
                </p>
              )}

            </div>

            <div className="shrink-0">

              <button
                type="button"
                onClick={requestSession}
                disabled={
                  requesting || requestSent
                }
                className={primaryButton}
              >
                {requesting
                  ? "Sending..."
                  : requestSent
                  ? "Request Sent"
                  : "Request a Session"}
              </button>

            </div>

          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2">

            {professional.specializations &&
              professional.specializations.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-stone-900">
                    Specializations
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {professional.specializations.map(
                      (item) => (
                        <span
                          key={item}
                          className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700"
                        >
                          {item}
                        </span>
                      )
                    )}
                  </div>
                </section>
              )}

            {professional.languages &&
              professional.languages.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-stone-900">
                    Languages
                  </h2>

                  <p className="mt-3 text-stone-600">
                    {professional.languages.join(", ")}
                  </p>
                </section>
              )}

            {professional.session_types &&
              professional.session_types.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-stone-900">
                    Session Types
                  </h2>

                  <p className="mt-3 text-stone-600">
                    {professional.session_types.join(", ")}
                  </p>
                </section>
              )}

            {professional.location && (
              <section>
                <h2 className="text-sm font-semibold text-stone-900">
                  Location
                </h2>

                <p className="mt-3 text-stone-600">
                  {professional.location}
                </p>
              </section>
            )}

            {professional.availability &&
              professional.availability.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-stone-900">
                    Availability
                  </h2>

                  <p className="mt-3 text-stone-600">
                    {professional.availability.join(", ")}
                  </p>
                </section>
              )}

          </div>

        </div>
      </div>
    </main>
  );
}