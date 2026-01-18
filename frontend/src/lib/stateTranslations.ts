type AustriaState =
    | "WIEN"
    | "NIEDEROESTERREICH"
    | "OBEROESTERREICH"
    | "SALZBURG"
    | "TIROL"
    | "VORARLBERG"
    | "KAERNTEN"
    | "STEIERMARK"
    | "BURGENLAND";

const stateTranslations: Record<AustriaState, string> = {
    WIEN: "Vienna",
    NIEDEROESTERREICH: "Lower Austria",
    OBEROESTERREICH: "Upper Austria",
    SALZBURG: "Salzburg",
    TIROL: "Tyrol",
    VORARLBERG: "Vorarlberg",
    KAERNTEN: "Carinthia",
    STEIERMARK: "Styria",
    BURGENLAND: "Burgenland",
};

export const translateState = (state: AustriaState): string => {
    return stateTranslations[state] || state;
};

export type { AustriaState };
