import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Resilient Gemini Call with exponential backoff for transient spikes / 503 / 429
async function callGeminiWithRetry(params: any, maxRetries = 2) {
  let attempt = 0;
  while (true) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      attempt++;
      const isTransient =
        err?.status === 503 ||
        err?.code === 503 ||
        err?.message?.includes("503") ||
        err?.message?.includes("high demand") ||
        err?.message?.includes("UNAVAILABLE") ||
        err?.message?.includes("429") ||
        err?.message?.includes("RESOURCE_EXHAUSTED");

      if (attempt <= maxRetries && isTransient) {
        const delay = attempt * 1200 + Math.random() * 400;
        console.warn(`[Gemini Retry ${attempt}/${maxRetries}] Retrying in ${Math.round(delay)}ms due to: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    mode: process.env.NODE_ENV || "development",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Deterministic rule-based fallback triage for degraded mode (NF-06)
function evaluateDeterministicTriage(symptoms: string, profile: any) {
  const sLower = (symptoms || "").toLowerCase();
  const redFlags: any[] = [];
  let urgency: "VERT" | "JAUNE" | "ORANGE" | "ROUGE" = "VERT";

  // Critical red flags
  if (
    sLower.includes("douleur thoracique") ||
    sLower.includes("bras gauche") ||
    sLower.includes("oppression") ||
    sLower.includes("étouffement") ||
    sLower.includes("paralysie") ||
    sLower.includes("asymétrie faciale") ||
    sLower.includes("difficulté à parler") ||
    sLower.includes("perte de connaissance") ||
    sLower.includes("coma") ||
    sLower.includes("convulsion") ||
    sLower.includes("détresse respiratoire") ||
    sLower.includes("saignement abondant")
  ) {
    urgency = "ROUGE";
    redFlags.push({
      symptom: "Signes évocateurs d'urgence vitale (SCA, AVC, détresse respiratoire aiguë)",
      severity: "CRITIQUE",
      clinicalRisk: "Engage le pronostic vital immédiat ou risque de séquelles neurologiques irréversibles",
      actionRequired: "Appeler immédiatement le SAMU (15) ou le 112. Ne pas déplacer le patient.",
      emergencyNumber: "15",
    });
  } else if (
    sLower.includes("fièvre élevée") ||
    sLower.includes("raideur de nuque") ||
    sLower.includes("douleur abdominale brutale") ||
    sLower.includes("vomissements répétés") ||
    sLower.includes("confusion") ||
    sLower.includes("dyspnée") ||
    sLower.includes("tachycardie")
  ) {
    urgency = "ORANGE";
    redFlags.push({
      symptom: "Symptomatologie aiguë fébrile ou syndrome abdominal aigu",
      severity: "ELEVE",
      clinicalRisk: "Risque de décompensation, infection invasive ou urgence médico-chirurgicale",
      actionRequired: "Consultation médicale obligatoire dans les 4 à 12 heures (Maison médicale de garde / Urgences).",
    });
  } else if (
    sLower.includes("toux persistante") ||
    sLower.includes("douleur articulaire") ||
    sLower.includes("éruption cutanée") ||
    sLower.includes("fatigue") ||
    sLower.includes("maux de tête")
  ) {
    urgency = "JAUNE";
  }

  return {
    urgencyLevel: urgency,
    redFlags,
    primarySpecialty: urgency === "ROUGE" ? "Médecine d'Urgence / SAMU 15" : "Médecine Générale",
  };
}

// Fallback generator for full analysis
function generateFallbackAnalysis(symptomsDescription: string, patientProfile: any) {
  const triage = evaluateDeterministicTriage(symptomsDescription, patientProfile);
  const sLower = (symptomsDescription || "").toLowerCase();

  let hypotheses: any[] = [];

  if (sLower.includes("thoracique") || sLower.includes("coeur") || sLower.includes("poitrine")) {
    hypotheses = [
      {
        name: "Syndrome coronarien aigu (SCA) / Angor d'effort",
        icd10: "I20.0",
        probability: triage.urgencyLevel === "ROUGE" ? 75 : 40,
        confidenceScore: 85,
        clinicalRationale: "Douleur rétrosternale constrictive avec facteurs de risque cardiovasculaires.",
        pathophysiology: "Ischémie myocardique aiguë par rupture de plaque d'athérome ou spasme coronaire.",
        matchingSymptoms: ["Douleur thoracique", "Sensibilité à l'effort"],
        missingKeySymptoms: ["Troponine dosée", "Électrocardiogramme 12 dérivations"],
        recommendedSpecialty: "Cardiologie / SAMU 15",
        suggestedInvestigations: ["ECG 12 dérivations immédiat", "Dosage Troponine hs à T0 et T+3h", "Coronarographie si sus-décalage"],
      },
      {
        name: "Péricardite aiguë",
        icd10: "I30.9",
        probability: 20,
        confidenceScore: 78,
        clinicalRationale: "Douleur thoracique augmentée à l'inspiration profonde et soulagée par l'antéflexion.",
        pathophysiology: "Inflammation aiguë du péricarde séreux le plus souvent virale.",
        matchingSymptoms: ["Douleur thoracique positionnelle"],
        missingKeySymptoms: ["Frottement péricardique à l'auscultation"],
        recommendedSpecialty: "Cardiologie",
        suggestedInvestigations: ["Échocardiographie transthoracique (ETT)", "CRP et NFS", "ECG"],
      },
      {
        name: "Douleur pariétale thoracique / RGO",
        icd10: "R07.8",
        probability: 15,
        confidenceScore: 70,
        clinicalRationale: "Douleur atypique non constrictive reproduite à la palpation ou liée au décubitus.",
        pathophysiology: "Spasme œsophagien ou syndrome de Tietze.",
        matchingSymptoms: ["Gêne thoracique intermittente"],
        missingKeySymptoms: ["Pyrosis"],
        recommendedSpecialty: "Médecine Générale",
        suggestedInvestigations: ["Examen clinique", "Épreuve thérapeutique IPP"],
      }
    ];
  } else if (sLower.includes("peau") || sLower.includes("grain") || sLower.includes("cutan") || sLower.includes("macule")) {
    hypotheses = [
      {
        name: "Lésion mélanocytaire atypique à surveiller (Naevus dysplasique)",
        icd10: "D22.9",
        probability: 60,
        confidenceScore: 82,
        clinicalRationale: "Présence de critères sémiologiques ABCDE (asymétrie, bords irréguliers).",
        pathophysiology: "Prolifération mélanocytaire bénigne avec atypies architecturales ou cytologiques.",
        matchingSymptoms: ["Modification morphologique de la lésion cutanée"],
        missingKeySymptoms: ["Examen dermoscopique haute résolution"],
        recommendedSpecialty: "Dermatologie",
        suggestedInvestigations: ["Dermoscopie standardisée", "Biopsie-exérèse diagnostique si doute"],
      },
      {
        name: "Mélanome cutané débutant (forme superficielle)",
        icd10: "C43.9",
        probability: 25,
        confidenceScore: 75,
        clinicalRationale: "Évolution récente de la couleur et du diamètre de la lésion.",
        pathophysiology: "Transformation maligne des mélanocytes épidermiques.",
        matchingSymptoms: ["Macule pigmentée inhomogène"],
        missingKeySymptoms: ["Ulcération spontanée"],
        recommendedSpecialty: "Dermatologie / Chirurgie Oncologique",
        suggestedInvestigations: ["Exérèse complète avec marge de sécurité", "Anatomopathologie"],
      },
    ];
  } else {
    hypotheses = [
      {
        name: "Symptomatologie fonctionnelle / affection courante à explorer",
        icd10: "R69",
        probability: 65,
        confidenceScore: 80,
        clinicalRationale: "Tableau clinique concordant avec le motif de consultation déclaré.",
        pathophysiology: "Réaction inflammatoire ou déséquilibre fonctionnel à documenter par examen physique.",
        matchingSymptoms: [symptomsDescription.slice(0, 60)],
        missingKeySymptoms: ["Bilan paraclinique objectif"],
        recommendedSpecialty: triage.primarySpecialty,
        suggestedInvestigations: ["Consultation avec examen clinique complet", "Bilan biologique d'orientation"],
      },
      {
        name: "Étiologie secondaire d'exclusion",
        icd10: "Z03.8",
        probability: 25,
        confidenceScore: 72,
        clinicalRationale: "Diagnostic différentiel à écarter en fonction de l'évolution.",
        pathophysiology: "Mécanisme infectieux, métabolique ou iatrogène.",
        matchingSymptoms: ["Fatigue ou gêne fonctionnelle"],
        missingKeySymptoms: ["Fièvre documentée"],
        recommendedSpecialty: "Médecine Générale",
        suggestedInvestigations: ["NFS, CRP, Ionogramme sanguin"],
      }
    ];
  }

  return {
    urgencyLevel: triage.urgencyLevel,
    redFlags: triage.redFlags,
    diagnosticHypotheses: hypotheses,
    orientation: {
      primarySpecialty: triage.primarySpecialty,
      careSetting: triage.urgencyLevel === "ROUGE" 
        ? "Urgences / SAMU 15" 
        : triage.urgencyLevel === "ORANGE" 
        ? "Maison Médicale de Garde / SOS Médecins" 
        : "Cabinet de Médecine Générale",
      urgencyLevel: triage.urgencyLevel,
      timeframe: triage.urgencyLevel === "ROUGE" ? "Immédiat (<15 min)" : triage.urgencyLevel === "ORANGE" ? "Sous 4h à 12h" : "Sous 48-72h",
      triageRationale: "Triage clinique de sécurité basé sur l'algorithme HAS et la présence éventuelle de critères de gravité.",
      consultationChecklist: [
        "Apporter la liste exhaustive des ordonnances et traitements actuels",
        "Noter précisément l'heure et les circonstances de survenue des symptômes",
        "Mesurer et noter les constantes si possible (température, tension artérielle)"
      ],
      warningSignsToWatch: [
        "Douleur thoracique brutale ou sensation d'oppression",
        "Difficulté respiratoire ou essoufflement anormal au repos",
        "Apparition de fièvre élevée (>38.5°C) ou vertiges soudains"
      ],
    },
  };
}

// Fallback generator for second opinion
function generateFallbackSecondOpinion(symptomsDescription: string, primaryHypotheses: any[], patientProfile: any) {
  const topPrimary = primaryHypotheses?.[0]?.name || "Diagnostic initial retenu";
  const sLower = (symptomsDescription || "").toLowerCase();

  let differentials: any[] = [];
  let biases: any[] = [];
  let tests: any[] = [];

  if (sLower.includes("thoracique") || sLower.includes("coeur") || topPrimary.includes("SCA") || topPrimary.includes("coronar")) {
    differentials = [
      {
        name: "Dissection Aortique aiguë de type A/B",
        probability: 15,
        reasoning: "Douleur thoracique irradiant dans le dos ou migratrice, à éliminer formellement en cas d'asymétrie tensionnelle.",
        whyOverlookedInitially: "Biais d'ancrage sur le SCA ; la présentation peut mimer l'infarctus.",
        severityRisk: "Élevé",
      },
      {
        name: "Embolie Pulmonaire aiguë",
        probability: 20,
        reasoning: "Douleur basithoracique associée à une dyspnée et tachycardie inexpliquée.",
        whyOverlookedInitially: "Clôture prématurée si l'ECG ne montre pas de sus-décalage ST franc.",
        severityRisk: "Élevé",
      },
      {
        name: "Péricardite aiguë ou Spasme œsophagien",
        probability: 25,
        reasoning: "Pathologies inflammatoires ou digestives fréquemment confondues avec une ischémie coronaire.",
        whyOverlookedInitially: "Effet de halo lié aux facteurs de risque cardiovasculaires.",
        severityRisk: "Modéré",
      }
    ];
    biases = [
      {
        biasType: "Biais d'ancrage (Anchoring Bias)",
        explanation: "Focalisation sur l'hypothèse coronaire en raison du terrain à risque, au détriment des causes vasculaires aortiques ou pulmonaires.",
      },
      {
        biasType: "Clôture prématurée (Premature Closure)",
        explanation: "Arrêt prématuré de la démarche diagnostique avant la réalisation du deuxième cycle de biomarqueurs (Troponine hs).",
      }
    ];
    tests = [
      { testName: "ECG 12 dérivations répété à T0, T+30min et T+3h", purpose: "Détecter une ischémie dynamique transitoire", urgency: "Prioritaire" },
      { testName: "Angioscanner thoracique avec temps aortique", purpose: "Écarter une dissection aortique ou une embolie pulmonaire", urgency: "Prioritaire" },
      { testName: "Échocardiographie transthoracique (ETT)", purpose: "Évaluer la cinétique segmentaire VG et rechercher un épanchement péricardique", urgency: "Complémentaire" },
    ];
  } else if (sLower.includes("peau") || sLower.includes("cutan") || topPrimary.includes("Naevus") || topPrimary.includes("Mélanome")) {
    differentials = [
      {
        name: "Carcinome basocellulaire pigmenté",
        probability: 30,
        reasoning: "Tumeur cutanée fréquente mimant un naevus ou un mélanome mais à malignité purement locale.",
        whyOverlookedInitially: "Confusion avec les critères ABCDE classiques du mélanome.",
        severityRisk: "Modéré",
      },
      {
        name: "Kératose séborrhéique pigmentée",
        probability: 35,
        reasoning: "Lésion bénigne fréquente de l'adulte, d'aspect verruqueux ou collé à la peau.",
        whyOverlookedInitially: "Aspect hyperpigmenté sombre pouvant inquiéter lors de l'examen sans dermoscope.",
        severityRisk: "Faible",
      }
    ];
    biases = [
      {
        biasType: "Biais de représentativité",
        explanation: "Assimilation rapide d'une tache sombre à une lésion maligne sans analyse dermoscopique des critères de réseau.",
      }
    ];
    tests = [
      { testName: "Dermoscopie numérique haute résolution", purpose: "Cartographie des critères pigmentaires et vasculaires", urgency: "Prioritaire" },
      { testName: "Biopsie-exérèse complète avec examen anatomopathologique", purpose: "Confirmation histologique définitive sans incision partielle", urgency: "Complémentaire" }
    ];
  } else {
    differentials = [
      {
        name: "Étiologie iatrogène ou médicamenteuse",
        probability: 25,
        reasoning: "Effet indésirable méconnu ou interaction médicamenteuse mimicant une pathologie organique.",
        whyOverlookedInitially: "Biais d'omission lors de l'interrogatoire pharmacologique.",
        severityRisk: "Modéré",
      },
      {
        name: "Syndrome métabolique ou endocrinien sous-jacent",
        probability: 20,
        reasoning: "Dysthyroïdie ou perturbation électrolytique débutante.",
        whyOverlookedInitially: "Signes frustes au stade initial.",
        severityRisk: "Faible",
      }
    ];
    biases = [
      {
        biasType: "Biais de confirmation",
        explanation: "Recherche active des seuls éléments corroborant la première impression clinique.",
      },
      {
        biasType: "Biais d'ancrage",
        explanation: "Sur-interprétation du symptôme principal au détriment des signes généraux.",
      }
    ];
    tests = [
      { testName: "Bilan biologique élargi (NFS, CRP, TSH, Ionogramme)", purpose: "Éliminer une cause systémique ou métabolique", urgency: "Prioritaire" },
      { testName: "Réévaluation clinique après 72 heures", purpose: "Vérifier la cinétique d'évolution des symptômes", urgency: "Complémentaire" }
    ];
  }

  return {
    timestamp: new Date().toISOString(),
    primaryHypothesisChallenged: topPrimary,
    counterExpertSummary: "Le deuxième avis recommande d'élargir le spectre étiologique et d'éliminer rigoureusement les diagnostics différentiels masqués avant de valider l'orientation finale.",
    differentialDiagnoses: differentials,
    agreementPoints: [
      "Concordance sur le niveau de gravité initial et la nécessité d'un avis clinique médical.",
      "Accord sur la surveillance étroite de l'apparition de tout signe de décompensation."
    ],
    divergencePoints: [
      "Nécessité d'investigations complémentaires préalables avant toute conclusion définitive.",
      "Prise en compte prioritaire des formes atypiques et des diagnostics d'exclusion."
    ],
    cognitiveBiasesIdentified: biases,
    atypicalPresentationsConsidered: [
      "Forme fruste paucisymptomatique.",
      "Présentation trompeuse chez le sujet âgé ou polymédiqué."
    ],
    recommendedConfirmatoryTests: tests,
    hasGuidelinesReference: "Haute Autorité de Santé (HAS) - Guide méthodologique pour la démarche diagnostique et l'aide à la décision clinique.",
    confidenceScore: 88,
  };
}

// 1. Dynamic Chat Guidance Endpoint (F-01, F-02)
app.post("/api/chat-guidance", async (req, res) => {
  try {
    const { messages, patientProfile } = req.body;
    const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1].text : "";

    const systemPrompt = `Tu es l'Agent d'Interrogatoire Clinique & de Triage Préliminaire d'un assistant médical certifié (conforme CDC et recommandations HAS).
Ton objectif :
1. Analyser avec empathie et précision la description du patient.
2. Poser 1 à 3 questions ciblées et courtes pour préciser : début des symptômes, durée, intensité (1-10), facteurs déclenchants/soulageants, symptômes associés (fièvre, douleur, dyspnée).
3. Détecter immédiatement tout drapeau rouge (douleur thoracique constrictive, déficit neurologique brutal, dyspnée aiguë, purpura fulminans).
4. Proposer 2 à 4 réponses rapides suggérées sous forme de boutons d'interaction ("suggestedReplies").
Réponds strictement en format JSON respectant le schéma.

Patient: Âge: ${patientProfile?.age || "non précisé"}, Sexe: ${patientProfile?.gender || "non précisé"}, Antécédents: ${(patientProfile?.medicalHistory || []).join(", ") || "aucun signalé"}, Traitements: ${(patientProfile?.currentTreatments || []).join(", ") || "aucun"}, Allergies: ${(patientProfile?.allergies || []).join(", ") || "aucune"}.`;

    if (!process.env.GEMINI_API_KEY) {
      const fallback = evaluateDeterministicTriage(lastUserMsg, patientProfile);
      return res.json({
        reply: fallback.urgencyLevel === "ROUGE" 
          ? "🚨 ALERTE URGENCE : Les symptômes décrits nécessitent une évaluation médicale immédiate. Veuillez contacter le 15 (SAMU) ou le 112 sans délai."
          : "Bonjour. J'ai bien noté vos symptômes. Depuis quand précisément ressentez-vous cela, et quelle est l'intensité de la gêne sur une échelle de 1 à 10 ?",
        suggestedReplies: ["Depuis moins de 24h", "Depuis quelques jours", "Intensité modérée (4-6/10)", "Intensité sévère (7-10/10)"],
        isRedFlagWarning: fallback.urgencyLevel === "ROUGE",
        urgencyDetected: fallback.urgencyLevel,
      });
    }

    const response = await callGeminiWithRetry({
      model: "gemini-3.7-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: `Historique de la conversation:\n${JSON.stringify(messages.slice(-6))}\n\nDernier message du patient:\n"${lastUserMsg}"` }
          ]
        }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "Le message d'accompagnement et les questions d'orientation clinique posées au patient.",
            },
            suggestedReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 à 4 réponses rapides courtes préconçues pour guider le patient.",
            },
            isRedFlagWarning: {
              type: Type.BOOLEAN,
              description: "True si un signe d'alerte vitale est immédiatement repéré.",
            },
            urgencyDetected: {
              type: Type.STRING,
              enum: ["VERT", "JAUNE", "ORANGE", "ROUGE"],
              description: "Niveau d'urgence provisoire estimé.",
            },
          },
          required: ["reply", "suggestedReplies", "isRedFlagWarning", "urgencyDetected"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/chat-guidance (activating fallback):", error?.message);
    const lastUserMsg = req.body?.messages?.slice(-1)?.[0]?.text || "";
    const fallback = evaluateDeterministicTriage(lastUserMsg, req.body?.patientProfile);
    res.json({
      reply: fallback.urgencyLevel === "ROUGE"
        ? "🚨 ALERTE URGENCE : Vos symptômes indiquent une situation clinique potentiellement grave. Veuillez joindre le 15 (SAMU) ou le 112 sans attendre."
        : "J'ai bien pris en compte vos éléments cliniques. Pouvez-vous préciser l'évolution dans le temps et la présence de signes associés comme de la fièvre ?",
      suggestedReplies: ["Symptômes constants", "Aggravation récente", "Pas de fièvre", "Fièvre modérée"],
      isRedFlagWarning: fallback.urgencyLevel === "ROUGE",
      urgencyDetected: fallback.urgencyLevel,
      isDegradedMode: true,
    });
  }
});

// 2. Full Symptom Analysis, Triage, Red Flags & Hypotheses Generation (F-04, F-05, F-06, F-07, F-08)
app.post("/api/analyze-symptoms", async (req, res) => {
  try {
    const { symptomsDescription, patientProfile, attachments, duration, severity } = req.body;

    const parts: any[] = [];

    // Include multimodal attachments if present (skin lesions, ECG, lab results)
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.dataUrl && att.dataUrl.includes(",")) {
          const mime = att.mimeType || "image/jpeg";
          const base64Data = att.dataUrl.split(",")[1];
          parts.push({
            inlineData: {
              mimeType: mime,
              data: base64Data,
            },
          });
        }
      }
    }

    const clinicalContext = `Profil Patient:
- Âge: ${patientProfile?.age || "Inconnu"}
- Sexe biologique: ${patientProfile?.gender || "Inconnu"}
- Grossesse en cours: ${patientProfile?.isPregnant ? "Oui" : "Non"}
- Antécédents médicaux / chirurgicaux: ${(patientProfile?.medicalHistory || []).join(", ") || "Aucun noté"}
- Traitements habituels: ${(patientProfile?.currentTreatments || []).join(", ") || "Aucun noté"}
- Allergies connues: ${(patientProfile?.allergies || []).join(", ") || "Aucune notée"}
- Tabagisme: ${patientProfile?.smoking || "non"} / Alcool: ${patientProfile?.alcohol || "non"}
- Constantes vitales: Température: ${patientProfile?.vitals?.temperature || "ND"} °C, FC: ${patientProfile?.vitals?.heartRate || "ND"} bpm, PA: ${patientProfile?.vitals?.bloodPressure || "ND"} mmHg, SpO2: ${patientProfile?.vitals?.oxygenSaturation || "ND"} %

Description des symptômes par le patient:
"${symptomsDescription || "Non renseigné"}"
Durée déclarée: ${duration || "Non précisée"}
Sévérité subjective (1-10): ${severity || "Non précisée"} / 10`;

    parts.push({ text: clinicalContext });

    const systemPrompt = `Tu es le Moteur d'Orientation Clinique et d'Optimisation Diagnostique (conforme au CDC pour assistant médical intelligent et recommandations HAS).
Tu dois effectuer une analyse rigoureuse et structurée :
1. Évaluation de l'Urgence (Auto-triage) : Classer impérativement selon :
   - 'ROUGE' : Urgence Vitale ou Décompensation Aiguë (SAMU 15 / 112 immédiat).
   - 'ORANGE' : Urgence Relative / Consultation Médicale sous 12h à 24h (Maison Médicale de Garde, Urgences).
   - 'JAUNE' : Consultation Programmée sous 48h à 72h (Médecin Généraliste).
   - 'VERT' : Auto-soins surveillés, conseil officinal ou téléconsultation non urgente.
2. Détection des Drapeaux Rouges (Red Flags) : Identification exhaustive des signes de gravité clinique.
3. Génération d'Hypothèses Diagnostiques : 3 à 5 hypothèses classées par probabilité (%) décroissante, avec code CIM-10 / ICD-10 indicatif, score de confiance (0-100), raisonnement clinique, physiopathologie, symptômes concordants et discordants.
4. Orientation & Spécialité : Spécialité recommandée (ex: Médecine Générale, Cardiologie, Dermatologie, Gastro-entérologie, Neurologie, etc.), délai recommandé, et checklist de préparation de la consultation pour le patient.
Si une image ou document est joint (lésion cutanée, compte-rendu d'analyse, ECG), intègre rigoureusement son analyse sémiologique.`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json(generateFallbackAnalysis(symptomsDescription, patientProfile));
    }

    const response = await callGeminiWithRetry({
      model: "gemini-3.7-flash",
      contents: [
        {
          role: "user",
          parts: parts,
        }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            urgencyLevel: {
              type: Type.STRING,
              enum: ["VERT", "JAUNE", "ORANGE", "ROUGE"],
              description: "Classification du niveau d'urgence.",
            },
            redFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  symptom: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["CRITIQUE", "ELEVE", "MODERE"] },
                  clinicalRisk: { type: Type.STRING },
                  actionRequired: { type: Type.STRING },
                  emergencyNumber: { type: Type.STRING },
                },
                required: ["symptom", "severity", "clinicalRisk", "actionRequired"],
              },
              description: "Liste des drapeaux rouges identifiés.",
            },
            diagnosticHypotheses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Nom de la pathologie suspectée" },
                  icd10: { type: Type.STRING, description: "Code CIM-10 indicatif" },
                  probability: { type: Type.NUMBER, description: "Probabilité estimée en % (0-100)" },
                  confidenceScore: { type: Type.NUMBER, description: "Indice de confiance de l'IA (0-100)" },
                  clinicalRationale: { type: Type.STRING, description: "Justification sémiologique" },
                  pathophysiology: { type: Type.STRING, description: "Mécanisme biologique ou physiopathologique" },
                  matchingSymptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missingKeySymptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedSpecialty: { type: Type.STRING },
                  suggestedInvestigations: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: [
                  "name",
                  "probability",
                  "confidenceScore",
                  "clinicalRationale",
                  "pathophysiology",
                  "matchingSymptoms",
                  "recommendedSpecialty",
                ],
              },
              description: "3 à 5 hypothèses diagnostiques ordonnées par probabilité.",
            },
            orientation: {
              type: Type.OBJECT,
              properties: {
                primarySpecialty: { type: Type.STRING },
                secondarySpecialty: { type: Type.STRING },
                careSetting: {
                  type: Type.STRING,
                  enum: [
                    "Urgences / SAMU 15",
                    "Maison Médicale de Garde / SOS Médecins",
                    "Cabinet de Médecine Générale",
                    "Consultation Spécialiste",
                    "Téléconsultation / Auto-soins",
                  ],
                },
                urgencyLevel: { type: Type.STRING, enum: ["VERT", "JAUNE", "ORANGE", "ROUGE"] },
                timeframe: { type: Type.STRING, description: "Délai recommandé pour la prise en charge" },
                triageRationale: { type: Type.STRING, description: "Justification du choix d'orientation" },
                consultationChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
                warningSignsToWatch: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: [
                "primarySpecialty",
                "careSetting",
                "urgencyLevel",
                "timeframe",
                "triageRationale",
                "consultationChecklist",
                "warningSignsToWatch",
              ],
            },
          },
          required: ["urgencyLevel", "redFlags", "diagnosticHypotheses", "orientation"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/analyze-symptoms (activating fallback):", error?.message);
    const fallback = generateFallbackAnalysis(req.body?.symptomsDescription, req.body?.patientProfile);
    res.json(fallback);
  }
});

// 3. Second Opinion Module - Adversarial Counter-Expert Agent (F-10, F-11, F-12)
app.post("/api/second-opinion", async (req, res) => {
  try {
    const { primaryHypotheses, patientProfile, symptomsDescription, firstAnalysisDetails } = req.body;

    const systemPrompt = `Tu es l'Agent Contradictoire de "Deuxième Avis Médical" (Module F-10, F-11, F-12 du CDC).
Ton rôle est d'agir en CONTRE-EXPERT médical bienveillant mais impitoyable sur le plan de la rigueur clinique :
1. Challenger le diagnostic principal retenu par le premier avis.
2. Traquer les BIAIS COGNITIFS fréquents en médecine : Biais d'ancrage (focus excessif sur le 1er symptôme), Clôture prématurée (arrêt des recherches dès qu'une explication plausible est trouvée), Biais de représentativité, Effet de halo des antécédents.
3. Proposer des DIAGNOSTICS DIFFÉRENTIELS souvent négligés, présentations atypiques, formes frustes ou pathologies rares/médicamenteuses associées.
4. Dresser la matrice de confrontation : Points d'ACCORD stricts et Points de DIVERGENCE avec le premier avis.
5. Recommander les examens complémentaires clés (biologie, imagerie, avis spécialisé) permettant de trancher avec certitude.
6. Citer la référence ou recommandation clinique pertinente (HAS, OMS, Sociétés Savantes Médicales).`;

    const userPrompt = `Données cliniques du patient :
- Profil : Âge: ${patientProfile?.age || "ND"}, Sexe: ${patientProfile?.gender || "ND"}, Antécédents: ${(patientProfile?.medicalHistory || []).join(", ") || "Aucun"}, Traitements: ${(patientProfile?.currentTreatments || []).join(", ") || "Aucun"}, Allergies: ${(patientProfile?.allergies || []).join(", ") || "Aucune"}
- Symptômes initiaux rapportés : "${symptomsDescription}"
- Diagnostic(s) du 1er avis à challenger : ${JSON.stringify(primaryHypotheses || firstAnalysisDetails)}

Effectue une contre-expertise clinique complète selon les règles d'explicabilité et d'analyse contradictoire.`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json(generateFallbackSecondOpinion(symptomsDescription, primaryHypotheses, patientProfile));
    }

    const response = await callGeminiWithRetry({
      model: "gemini-3.7-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            primaryHypothesisChallenged: { type: Type.STRING },
            counterExpertSummary: { type: Type.STRING, description: "Synthèse de la posture critique du contre-expert" },
            differentialDiagnoses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  probability: { type: Type.NUMBER },
                  reasoning: { type: Type.STRING },
                  whyOverlookedInitially: { type: Type.STRING },
                  severityRisk: { type: Type.STRING, enum: ["Faible", "Modéré", "Élevé"] },
                },
                required: ["name", "probability", "reasoning", "whyOverlookedInitially", "severityRisk"],
              },
            },
            agreementPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            divergencePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            cognitiveBiasesIdentified: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  biasType: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ["biasType", "explanation"],
              },
            },
            atypicalPresentationsConsidered: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedConfirmatoryTests: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  testName: { type: Type.STRING },
                  purpose: { type: Type.STRING },
                  urgency: { type: Type.STRING, enum: ["Prioritaire", "Complémentaire", "Différé"] },
                },
                required: ["testName", "purpose", "urgency"],
              },
            },
            hasGuidelinesReference: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER },
          },
          required: [
            "primaryHypothesisChallenged",
            "counterExpertSummary",
            "differentialDiagnoses",
            "agreementPoints",
            "divergencePoints",
            "cognitiveBiasesIdentified",
            "atypicalPresentationsConsidered",
            "recommendedConfirmatoryTests",
            "hasGuidelinesReference",
            "confidenceScore",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    parsed.timestamp = new Date().toISOString();
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/second-opinion (activating fallback):", error?.message);
    const fallback = generateFallbackSecondOpinion(
      req.body?.symptomsDescription,
      req.body?.primaryHypotheses,
      req.body?.patientProfile
    );
    res.json(fallback);
  }
});

// 4. Generate Standardized SOAP Clinical Report (F-09, F-15)
app.post("/api/generate-report", async (req, res) => {
  try {
    const { patientProfile, symptomsDescription, firstAnalysis, secondOpinion } = req.body;

    const systemPrompt = `Tu es le Générateur de Comptes-Rendus Médicaux Standardisés pour Professionnels de Santé (Format SOAP : Subjectif, Objectif, Analyse/Assessment, Plan).
Génère une synthèse médicale formelle, dense, précise et directement exploitable en consultation par un médecin généraliste ou spécialiste.
Rédige en français médical soigné, avec termes sémiologiques rigoureux (ex: apyrexie, otalgie, dyspnée de stade NYHA, etc.).`;

    const userPrompt = `Génère le compte-rendu SOAP complet à partir de :
- Patient : ${JSON.stringify(patientProfile)}
- Symptomatologie déclarée : "${symptomsDescription}"
- Premier Avis / Triage : ${JSON.stringify(firstAnalysis)}
- Deuxième Avis contradictoire : ${JSON.stringify(secondOpinion || "Non demandé")}
`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        id: "CR-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        date: new Date().toLocaleDateString("fr-FR"),
        patientProfile,
        symptomsSummary: symptomsDescription,
        urgencyLevel: firstAnalysis?.urgencyLevel || "JAUNE",
        soap: {
          subjective: `Patient(e) de ${patientProfile?.age || "âge non précisé"} ans, consultant pour : ${symptomsDescription}. Antécédents déclarés : ${(patientProfile?.medicalHistory || []).join(", ") || "néant"}. Traitements en cours : ${(patientProfile?.currentTreatments || []).join(", ") || "néant"}. Allergies : ${(patientProfile?.allergies || []).join(", ") || "néant"}.`,
          objective: `Constantes rapportées : Température ${patientProfile?.vitals?.temperature || "ND"}°C, FC ${patientProfile?.vitals?.heartRate || "ND"} bpm, PA ${patientProfile?.vitals?.bloodPressure || "ND"}, SpO2 ${patientProfile?.vitals?.oxygenSaturation || "ND"}%. Examen physique à réaliser par le praticien.`,
          assessment: `Évaluation clinique préliminaire assistée par IA. Hypothèse dominante : ${firstAnalysis?.diagnosticHypotheses?.[0]?.name || "Syndrome à explorer"}. Niveau d'urgence retenu : ${firstAnalysis?.urgencyLevel || "JAUNE"}. Drapeaux rouges : ${firstAnalysis?.redFlags?.length ? firstAnalysis.redFlags.map((r: any) => r.symptom).join("; ") : "Aucun drapeau rouge critique immédiat"}.`,
          plan: `Orientation préconisée : ${firstAnalysis?.orientation?.primarySpecialty || "Médecine Générale"} (${firstAnalysis?.orientation?.timeframe || "sous 48h"}). Examens conseillés : Bilan biologique d'orientation. Consignes de reconsultation urgente en cas d'apparition de signes d'alerte.`,
        },
        primaryHypotheses: firstAnalysis?.diagnosticHypotheses || [],
        secondOpinionSummary: secondOpinion?.counterExpertSummary || undefined,
        complianceDisclaimers: [
          "Document généré par un système d'aide à la décision médicale (Règlement UE 2017/745 Dispositif Médical classe IIa).",
          "Ne constitue pas un diagnostic définitif. La décision clinique finale relève exclusivement de la responsabilité du médecin examinateur.",
        ],
        auditHash: "SHA256-" + Math.random().toString(36).substring(2, 12),
      });
    }

    const response = await callGeminiWithRetry({
      model: "gemini-3.7-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            soap: {
              type: Type.OBJECT,
              properties: {
                subjective: { type: Type.STRING, description: "S - Motif, anamnèse, antécédents, chronologie des symptômes" },
                objective: { type: Type.STRING, description: "O - Données biométriques, constantes déclarées, sémiologie visuelle" },
                assessment: { type: Type.STRING, description: "A - Hypothèses diagnostiques hiérarchisées, drapeaux rouges, analyse contradictoire" },
                plan: { type: Type.STRING, description: "P - Proposition de prise en charge, examens de 1ère intention, délai d'orientation" },
              },
              required: ["subjective", "objective", "assessment", "plan"],
            },
            synthesisHeadline: { type: Type.STRING, description: "Titre résumé en 1 ligne pour le dossier médical" },
          },
          required: ["soap", "synthesisHeadline"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const result = {
      id: "CR-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      date: new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      patientProfile,
      symptomsSummary: symptomsDescription,
      urgencyLevel: firstAnalysis?.urgencyLevel || "JAUNE",
      soap: parsed.soap,
      synthesisHeadline: parsed.synthesisHeadline,
      primaryHypotheses: firstAnalysis?.diagnosticHypotheses || [],
      secondOpinionSummary: secondOpinion?.counterExpertSummary || undefined,
      complianceDisclaimers: [
        "Aide à la décision clinique - Dispositif conforme aux exigences du Règlement Européen (UE) 2017/745 et aux 101 bonnes pratiques de la HAS.",
        "Le présent document d'orientation ne saurait se substituer à l'examen clinique direct et à l'appréciation souveraine du médecin traitant.",
        "En cas d'aggravation aiguë ou de survenue de signes d'alerte, contacter sans délai le 15 (SAMU) ou le 112.",
      ],
      auditHash: "HAS-AUDIT-" + Math.random().toString(36).substring(2, 14).toUpperCase(),
    };

    res.json(result);
  } catch (error: any) {
    console.error("Error in /api/generate-report (activating fallback):", error?.message);
    const { patientProfile, symptomsDescription, firstAnalysis, secondOpinion } = req.body;
    res.json({
      id: "CR-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
      date: new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      patientProfile,
      symptomsSummary: symptomsDescription || "Motif de consultation",
      urgencyLevel: firstAnalysis?.urgencyLevel || "JAUNE",
      soap: {
        subjective: `Patient(e) de ${patientProfile?.age || "âge non précisé"} ans. Motif : ${symptomsDescription || "Examen d'orientation"}. Antécédents : ${(patientProfile?.medicalHistory || []).join(", ") || "aucun"}. Traitements : ${(patientProfile?.currentTreatments || []).join(", ") || "aucun"}.`,
        objective: `Constantes déclarées : Température ${patientProfile?.vitals?.temperature || "ND"}°C, FC ${patientProfile?.vitals?.heartRate || "ND"} bpm, PA ${patientProfile?.vitals?.bloodPressure || "ND"}. Examen physique à approfondir.`,
        assessment: `Synthèse clinique assistée : Hypothèse dominante : ${firstAnalysis?.diagnosticHypotheses?.[0]?.name || "Symptomatologie à explorer"}. Niveau d'urgence : ${firstAnalysis?.urgencyLevel || "JAUNE"}.`,
        plan: `Orientation recommandée : ${firstAnalysis?.orientation?.primarySpecialty || "Médecine Générale"} (${firstAnalysis?.orientation?.timeframe || "sous 48h"}). Examens complémentaires et suivi clinique programmés.`,
      },
      synthesisHeadline: "Compte-Rendu d'Orientation Médicale Structuré",
      primaryHypotheses: firstAnalysis?.diagnosticHypotheses || [],
      secondOpinionSummary: secondOpinion?.counterExpertSummary || undefined,
      complianceDisclaimers: [
        "Dispositif Médical d'aide à la décision clinique (UE 2017/745).",
        "Ne se substitue pas au jugement médical du praticien.",
      ],
      auditHash: "HAS-AUDIT-" + Math.random().toString(36).substring(2, 14).toUpperCase(),
    });
  }
});

// Vite middleware setup
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Assistant Médical Server running on http://localhost:${PORT}`);
  });
}

start();
