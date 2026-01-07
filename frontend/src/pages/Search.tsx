import { useEffect, useState } from "react";
import api from "../services/api";

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

type PetSitter = {
  userId: number;
  username: string;
  state: AustriaState;
  petSitter: {
    aboutText?: string;
    averageRating: number;
    petTypes: string[];
  };
};

export default function Search() {
  const [sitters, setSitters] = useState<PetSitter[]>([]);
  const [state, setState] = useState<string>("");
  const [petType, setPetType] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function fetchSitters() {
    setLoading(true);

    const params: any = {};
    if (state) params.state = state;
    if (petType) params.petType = petType;

    try {
      const res = await api.get("/api/users/sitters", { params });
      setSitters(res.data);
    } catch (err) {
      console.error("Failed to load sitters", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSitters();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Find a Pet Sitter</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <select
          className="border p-2 rounded"
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          <option value="">All Locations</option>
          {[
            "WIEN",
            "NIEDEROESTERREICH",
            "OBEROESTERREICH",
            "SALZBURG",
            "TIROL",
            "VORARLBERG",
            "KAERNTEN",
            "STEIERMARK",
            "BURGENLAND",
          ].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={petType}
          onChange={(e) => setPetType(e.target.value)}
        >
          <option value="">All Pet Types</option>
          <option value="DOG">Dog</option>
          <option value="CAT">Cat</option>
        </select>

        <button
          onClick={fetchSitters}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <p>Loading sitters...</p>
      ) : sitters.length === 0 ? (
        <p>No sitters found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sitters.map((sitter) => (
            <div
              key={sitter.userId}
              className="border rounded-lg p-4 shadow"
            >
              <h2 className="text-xl font-semibold">{sitter.username}</h2>
              <p className="text-sm text-gray-500">{sitter.state}</p>

              <p className="mt-2 text-sm">
                {sitter.petSitter.aboutText || "No description provided."}
              </p>

              <p className="mt-2 text-sm">
                Pets: {sitter.petSitter.petTypes.join(", ")}
              </p>

              <p className="mt-2 text-sm">
                Rating: ⭐ {sitter.petSitter.averageRating.toFixed(1)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

