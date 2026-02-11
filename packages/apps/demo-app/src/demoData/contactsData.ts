import type { packsAsConst } from "@superego/bazaar";
import { DataType, type TypeOf } from "@superego/schema";

type Contact = TypeOf<(typeof packsAsConst)[3]["collections"][0]["schema"]>;

export default [
  {
    type: "Person",
    name: "Marco Fontana",
    relation: "High school friend",
    phones: [
      {
        number: "+393347778888",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "marco.fontana@designhub.it",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Based in Milan; shares weekend cycling routes and gear tips.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Chiara Mancini",
    relation: "University friend",
    phones: [
      {
        number: "+390651112233",
        description: "Work",
      },
    ],
    emails: [
      {
        address: "chiara.mancini@example.com",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Rome-based UX researcher offering product discovery feedback on prototypes.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Davide Vitale",
    relation: "Cycling buddy",
    phones: [
      {
        number: "+393488990011",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "davide.vitale@example.com",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Lives in Bologna and trains with the Collina Riders club to keep pace goals on track.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Francesca Galli",
    relation: "Design collaborator",
    phones: [
      {
        number: "+390282204400",
        description: "Studio",
      },
    ],
    emails: [
      {
        address: "francesca.galli@ateliergalli.it",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Independent Milan designer who prefers afternoon collaboration calls.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Lorenzo Greco",
    relation: "Startup founder friend",
    phones: [
      {
        number: "+393274556677",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "lorenzo@urbanroots.it",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Turin-based founder of Urban Roots seeking backend mentorship for his platform.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Elisa Caruso",
    relation: "Former neighbor",
    phones: [
      {
        number: "+393209998877",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "elisa.caruso@example.com",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Old Milan neighbor now in Trieste; keeps him posted on apartment news back home.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Matteo Ferri",
    relation: "Band mate",
    phones: [
      {
        number: "+393485551212",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "matteo.ferri@example.com",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Bass player from the City Echo band; schedules jam sessions when he returns to Italy.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Silvia Lombardi",
    relation: "Yoga friend",
    phones: [
      {
        number: "+393462221111",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "silvia.lombardi@example.com",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Florence yoga friend planning a May retreat near Siena and recruiting attendees.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Nicola Bianchi",
    relation: "Running club friend",
    phones: [
      {
        number: "+393277003344",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "nicola.bianchi@example.com",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Runs with the Parco Sempione club and serves as a half-marathon pace partner.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Federica Bruno",
    relation: "Book club friend",
    phones: [
      {
        number: "+393488812299",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "federica.bruno@example.com",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Book club mate from Libreria Verso gatherings who shares contemporary fiction picks.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Tomas Kazlauskas",
    relation: "Friend - Vilnius",
    phones: [
      {
        number: "+37061233445",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "tomas.kazlauskas@example.lt",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Met at Coworking Loft in Vilnius; regular pint nights together at Deveti.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Ruta Jankauskaite",
    relation: "Friend - Vilnius",
    phones: [
      {
        number: "+37061099876",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "ruta.jankauskaite@example.lt",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Illustrator friend who organizes monthly brunch sketch sessions around the Old Town.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Mantas Petrauskas",
    relation: "Basketball buddy",
    phones: [
      {
        number: "+37062011223",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "mantas.petrauskas@example.lt",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Guard at Sauletekis gym who pulls him into Thursday night pickup basketball games.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Aiste Vasiliauskaite",
    relation: "Friend - Vilnius",
    phones: [
      {
        number: "+37069988776",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "aiste.vasiliauskaite@example.lt",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Interior designer meeting at Mint Vinetu to refine workspace ideas and decor picks.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Milda Zukauskiene",
    relation: "Hiking friend",
    phones: [
      {
        number: "+37067544321",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "milda.zukauskiene@example.lt",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Aukstaitija hiking partner who swaps gear and itinerary notes every spring.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Gediminas Urbonas",
    relation: "Coffee enthusiast friend",
    phones: [
      {
        number: "+37061155667",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "gediminas.urbonas@example.lt",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Crooked Nose regular experimenting with home roasting alongside him.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Justina Balciunaite",
    relation: "Photography buddy",
    phones: [
      {
        number: "+37063033445",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "justina.balciunaite@example.lt",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilnius street photography partner shooting around Uzupis with Fuji X-T5 gear.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Mindaugas Grigas",
    relation: "Tech meetup organizer",
    phones: [
      {
        number: "+37064066778",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "mindaugas.grigas@vilniusdevs.lt",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Organizes Vilnius JS and ropes him into volunteering at the check-in desk.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Kotryna Paulauskaite",
    relation: "Language exchange partner",
    phones: [
      {
        number: "+37062244556",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "kotryna.paulauskaite@example.lt",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Meets at Vilnius University library for Italian-Lithuanian language swaps.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Jonas Navickas",
    relation: "Neighbor",
    phones: [
      {
        number: "+37061288990",
        description: "Mobile",
      },
    ],
    emails: [],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Fourth-floor neighbor who collects packages while he is traveling.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Greta Vaitkeviciute",
    relation: "Climbing partner",
    phones: [
      {
        number: "+37060123456",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "greta.vaitkeviciute@example.lt",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vertical gym climbing partner focused on finishing a 6b project together.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Karolis Mockus",
    relation: "Local developer friend",
    phones: [
      {
        number: "+37067788991",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "karolis.mockus@example.lt",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Working on smart garden sensors and brainstorming IoT integrations.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Anna Schneider",
    relation: "Product owner - Berlin",
    phones: [
      {
        number: "+493012345670",
        description: "Work",
      },
    ],
    emails: [
      {
        address: "anna.schneider@kreuzcode.de",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Berlin product owner at Kreuzcode coordinating the marketplace roadmap.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Pieter de Vries",
    relation: "CTO - Amsterdam",
    phones: [
      {
        number: "+31201234567",
        description: "Work",
      },
    ],
    emails: [
      {
        address: "pieter@canalstack.nl",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Amsterdam CTO of CanalStack syncing on data migration milestones.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Sofia Lindstrom",
    relation: "Data lead - Stockholm",
    phones: [
      {
        number: "+46812345670",
        description: "Work",
      },
    ],
    emails: [
      {
        address: "sofia.lindstrom@auroradata.se",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Stockholm data lead at AuroraData scheduling early stand-ups due to timezone differences.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Miguel Alvarez",
    relation: "DevOps lead - Madrid",
    phones: [
      {
        number: "+34911222333",
        description: "Work",
      },
    ],
    emails: [
      {
        address: "miguel.alvarez@ibericode.es",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Madrid DevOps lead at IberiCode aligning pipeline automation workstreams.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Emma Sorensen",
    relation: "Design lead - Copenhagen",
    phones: [
      {
        number: "+4531122233",
        description: "Work",
      },
    ],
    emails: [
      {
        address: "emma.sorensen@nordcrea.dk",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Copenhagen design lead at Nordcrea hosting a June workshop with him.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Nora Nieminen",
    relation: "QA lead - Helsinki",
    phones: [
      {
        number: "+358401112233",
        description: "Work",
      },
    ],
    emails: [
      {
        address: "nora.nieminen@clarionlabs.fi",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Helsinki QA lead at Clarion Labs sharing regression suite updates.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Lina Kairiene",
    relation: "Landlord",
    phones: [
      {
        number: "+37061255667",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "lina.kairiene@example.lt",
        description: "Personal",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilnius landlord who prefers Viber messages and rent payments on the 5th.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Dr Vitas Jurevicius",
    relation: "Physiotherapist",
    phones: [
      {
        number: "+37065099887",
        description: "Clinic",
      },
    ],
    emails: [
      {
        address: "info@centrumfizio.lt",
        description: "Clinic",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Physiotherapist at Centrum Fizio scheduling quarterly check-ins for posture work.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Simona Ruta",
    relation: "Massage therapist",
    phones: [
      {
        number: "+37062066778",
        description: "Studio",
      },
    ],
    emails: [
      {
        address: "simona.ruta@relaxvilnius.lt",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Massage therapist at Relax Vilnius keeping Tuesday evening slots for him.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Paulius Eidenis",
    relation: "Accountant",
    phones: [
      {
        number: "+37061144332",
        description: "Office",
      },
    ],
    emails: [
      {
        address: "paulius.eidenis@balanse.lt",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Accountant at Balanse handling annual filings and VAT questions.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Jurga Petraityte",
    relation: "Marketing strategist - Vilnius",
    phones: [
      {
        number: "+37062123489",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "jurga.petraityte@uptowncreative.lt",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilnius marketing strategist supporting positioning work for Baltic tech clients.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Luca Baresi",
    relation: "Coworking founder - Milan",
    phones: [
      {
        number: "+393475559900",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "luca@loftmilan.it",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Runs the Milan Loft coworking space and secures day passes during Italian visits.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Alvaro Moreira",
    relation: "Product owner - Lisbon",
    phones: [
      {
        number: "+351212345678",
        description: "Work",
      },
    ],
    emails: [
      {
        address: "alvaro.moreira@brightcodex.pt",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Lisbon product owner at BrightCodex coordinating a pan-EU SaaS rollout.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Elena Karpova",
    relation: "QA manager - Riga",
    phones: [
      {
        number: "+37166112233",
        description: "Work",
      },
    ],
    emails: [
      {
        address: "elena.karpova@balticaapps.lv",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Riga QA manager at Baltica Apps relying on his automation playbooks.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Markus Vogel",
    relation: "Operations head - Munich",
    phones: [
      {
        number: "+498912345655",
        description: "Work",
      },
    ],
    emails: [
      {
        address: "markus.vogel@alpinegrid.de",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Munich operations head at AlpineGrid syncing on reporting dashboards and KPIs.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Egle Skirmantaite",
    relation: "Pilates instructor",
    phones: [
      {
        number: "+37065011223",
        description: "Studio",
      },
    ],
    emails: [
      {
        address: "egle@pilateslab.lt",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Vilnius pilates instructor reserving early-morning core sessions twice a month.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Laura Pini",
    relation: "Friend - Berlin",
    phones: [
      {
        number: "+491578334455",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "laura.pini@climatetech.eu",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Italian friend in Berlin working in climate tech and hosting pop-up meetups when he visits.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Person",
    name: "Rokas Jarmala",
    relation: "Specialty coffee roaster",
    phones: [
      {
        number: "+37067700112",
        description: "Mobile",
      },
    ],
    emails: [
      {
        address: "rokas@smallbatch.lt",
        description: "Work",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Runs Small Batch roastery in Vilnius and sets aside limited beans for experiments.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Organization",
    name: "Blue Bridge Analytics",
    relation: "Client",
    phones: [
      {
        number: "+37064591027",
        description: "Main",
      },
    ],
    emails: [
      {
        address: "hello@blue-bridge-analytics.com",
        description: "General",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Lithuanian analytics client focused on modernizing their core platform.",
            },
          ],
        },
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Account manager: Alessandro Esposito.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Organization",
    name: "Nordic Mesh Labs",
    relation: "Client",
    phones: [
      {
        number: "+393512345678",
        description: "Main",
      },
    ],
    emails: [
      {
        address: "hello@nordic-mesh-labs.com",
        description: "General",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Italian portal project aiming to improve customer onboarding flows.",
            },
          ],
        },
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Account manager: Luca Ricci.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Organization",
    name: "VilniaCode Collective",
    relation: "Client",
    phones: [
      {
        number: "+49721123456",
        description: "Main",
      },
    ],
    emails: [
      {
        address: "hello@vilniacode-collective.com",
        description: "General",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "German cooperative rolling out an ERP integration across regional offices.",
            },
          ],
        },
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Account manager: Matteo Marino.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Organization",
    name: "Apulia Systems",
    relation: "Client",
    phones: [
      {
        number: "+31854098765",
        description: "Main",
      },
    ],
    emails: [
      {
        address: "hello@apulia-systems.com",
        description: "General",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Netherlands-based team building a bespoke mobile app for field consultants.",
            },
          ],
        },
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Account manager: Giulia Greco.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Organization",
    name: "Aurora Grid Partners",
    relation: "Client",
    phones: [
      {
        number: "+46708234123",
        description: "Main",
      },
    ],
    emails: [
      {
        address: "hello@aurora-grid-partners.com",
        description: "General",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Swedish energy client commissioning an e-commerce rebuild for prosumer services.",
            },
          ],
        },
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Account manager: Elena Bruno.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Organization",
    name: "Cascina Tech Studio",
    relation: "Client",
    phones: [
      {
        number: "+4745891234",
        description: "Main",
      },
    ],
    emails: [
      {
        address: "hello@cascina-tech-studio.com",
        description: "General",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Norwegian consultancy delivering a data warehouse initiative with his guidance.",
            },
          ],
        },
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Account manager: Francesca Galli.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Organization",
    name: "Baltic Semaphore",
    relation: "Client",
    phones: [
      {
        number: "+34912345670",
        description: "Main",
      },
    ],
    emails: [
      {
        address: "hello@baltic-semaphore.com",
        description: "General",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Spanish logistics client experimenting with an AI pilot for routing.",
            },
          ],
        },
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Account manager: Marco Fontana.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Organization",
    name: "Trastevere Digital",
    relation: "Client",
    phones: [
      {
        number: "+4536891122",
        description: "Main",
      },
    ],
    emails: [
      {
        address: "hello@trastevere-digital.com",
        description: "General",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Danish agency leaning on his team augmentation support for a civic platform.",
            },
          ],
        },
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Account manager: Chiara Mancini.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Organization",
    name: "Ridgeway Infoworks",
    relation: "Client",
    phones: [
      {
        number: "+358401234567",
        description: "Main",
      },
    ],
    emails: [
      {
        address: "hello@ridgeway-infoworks.com",
        description: "General",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Finnish client undergoing a DevOps audit across multiple squads.",
            },
          ],
        },
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Account manager: Davide Vitale.",
            },
          ],
        },
      ],
    },
  },
  {
    type: "Organization",
    name: "Fjord Loop Consultancy",
    relation: "Client",
    phones: [
      {
        number: "+32478123456",
        description: "Main",
      },
    ],
    emails: [
      {
        address: "hello@fjord-loop-consultancy.com",
        description: "General",
      },
    ],
    notes: {
      __dataType: DataType.JsonObject,
      type: "doc",
      content: [
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Belgian consultancy managing a cloud migration program across business units.",
            },
          ],
        },
        {
          type: "paragraph",
          attrs: {
            textAlign: null,
          },
          content: [
            {
              type: "text",
              text: "Account manager: Sofia Barbieri.",
            },
          ],
        },
      ],
    },
  },
] satisfies Contact[];
