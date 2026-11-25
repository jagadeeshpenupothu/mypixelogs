import type { VideoTemplate } from "@/types/video-template";

const te = {
  verse: "వివాహము అన్ని\nవిషయములలో\nఘనమైనది.", reference: "హెబ్రీయులకు 13:4",
  family: "రెడ్డి వారి", title: "వివాహ ఆహ్వానం",
  opening: "ప్రభువైన యేసుక్రీస్తు నామములో", groom: "అర్జున్", and: "మరియు", bride: "అనన్య",
  closing: "పవిత్ర వివాహ బంధంలో ఒక్కటవుతున్న శుభ తరుణం",
  groomLabel: "వరుడు", groom2: "అర్జున్", groomFather: "శ్రీ రాజేష్ రెడ్డి", groomMother: "శ్రీమతి లక్ష్మి", groomRelation: "గార్ల కుమారుడు",
  brideLabel: "వధువు", bride2: "అనన్య", brideFather: "శ్రీ సురేష్ కుమార్", brideMother: "శ్రీమతి పద్మ", brideRelation: "గార్ల కుమార్తె",
  invitation: "ప్రభువునందు మా వివాహ వేడుకకు\nప్రేమతో ఆహ్వానిస్తున్నాము.",
  eventTitle: "వివాహ మహోత్సవం", date: "శుక్రవారం, జనవరి 15, 2027", time: "ఉదయం 10:00 గంటలకు", venueLabel: "వివాహ వేదిక", venue: "శుభం కన్వెన్షన్ హాల్", city: "మెయిన్ రోడ్, విజయవాడ",
  mealTitle: "విందు", mealDate: "శుక్రవారం, జనవరి 15, 2027", mealTime: "మధ్యాహ్నం 12:30 గంటలకు", mealVenue: "వివాహ వేదిక వద్ద", mealCity: "",
  thanks: "ప్రభువు నామమున", thanks2: "మీ అందరికీ మా\nహృదయపూర్వక\nఆహ్వానం.",
};

const en: typeof te = {
  verse: "Marriage is\nhonourable\nin all things.", reference: "Hebrews 13:4",
  family: "The Reddy Family", title: "Wedding Invitation",
  opening: "In the name of our Lord Jesus Christ", groom: "Arjun", and: "and", bride: "Ananya",
  closing: "are joining together in holy matrimony",
  groomLabel: "The Groom", groom2: "Arjun", groomFather: "Mr. Rajesh Reddy", groomMother: "Mrs. Lakshmi", groomRelation: "Proud parents of the groom",
  brideLabel: "The Bride", bride2: "Ananya", brideFather: "Mr. Suresh Kumar", brideMother: "Mrs. Padma", brideRelation: "Proud parents of the bride",
  invitation: "With love, we invite you\nto celebrate our wedding.",
  eventTitle: "Wedding Ceremony", date: "Friday, January 15, 2027", time: "at 10:00 in the morning", venueLabel: "Venue", venue: "Shubham Convention Hall", city: "Main Road, Vijayawada",
  mealTitle: "Lunch", mealDate: "Friday, January 15, 2027", mealTime: "at 12:30 in the afternoon", mealVenue: "At the wedding venue", mealCity: "",
  thanks: "With God's blessing", thanks2: "We warmly\ninvite you all.",
};

export const weddingVideo: VideoTemplate = {
  slug: "watercolor-wedding-invitation-video",
  size: { width: 2560, height: 1080 },
  assets: "/video-templates/wedding",
  themes: [
    { id: "gold", name: "Blue & Gold", swatch: ["#8fb3c4", "#b9832b"] },
    { id: "pink", name: "Pink & Purple", swatch: ["#e3a9c2", "#8a4f9e"] },
  ],
  samples: { te, en },
  scenes: [
    { id: "verse", name: "Opening verse", time: 5, emblem: true, fields: [{ id: "verse", label: "Verse or blessing", lines: 3 }, { id: "reference", label: "Reference" }] },
    { id: "title", name: "Title", time: 12.5, fields: [{ id: "family", label: "Family name" }, { id: "title", label: "Title" }] },
    { id: "names", name: "Names", time: 21, fields: [{ id: "opening", label: "Opening line" }, { id: "groom", label: "First name" }, { id: "and", label: "Joining word" }, { id: "bride", label: "Second name" }, { id: "closing", label: "Closing line" }] },
    { id: "groom", name: "Groom", time: 26.3, photo: "groom", fields: [{ id: "groomLabel", label: "Label" }, { id: "groom2", label: "Groom's name" }, { id: "groomFather", label: "Father" }, { id: "groomMother", label: "Mother" }, { id: "groomRelation", label: "Relation" }] },
    { id: "bride", name: "Bride", time: 30.2, photo: "bride", fields: [{ id: "brideLabel", label: "Label" }, { id: "bride2", label: "Bride's name" }, { id: "brideFather", label: "Father" }, { id: "brideMother", label: "Mother" }, { id: "brideRelation", label: "Relation" }] },
    { id: "couple", name: "Couple", time: 36, photo: "couple", fields: [{ id: "invitation", label: "Invitation line", lines: 2 }] },
    { id: "event", name: "Wedding details", time: 42, fields: [{ id: "eventTitle", label: "Title" }, { id: "date", label: "Date" }, { id: "time", label: "Time" }, { id: "venueLabel", label: "Venue label" }, { id: "venue", label: "Venue" }, { id: "city", label: "Address" }] },
    { id: "meal", name: "Meal", time: 46.5, fields: [{ id: "mealTitle", label: "Title" }, { id: "mealDate", label: "Date" }, { id: "mealTime", label: "Time" }, { id: "mealVenue", label: "Place" }, { id: "mealCity", label: "Extra line (optional)" }] },
    { id: "thanks", name: "Closing", time: 49.3, fields: [{ id: "thanks", label: "First line" }, { id: "thanks2", label: "Message", lines: 3 }] },
  ],
  /** Where each photo shows, in template pixels. A photo always covers its area. */
  photoAreas: {
    groom: { x: 2035, y: 540, width: 1250, height: 1180 },
    bride: { x: 510, y: 540, width: 1250, height: 1180 },
    couple: { x: 1285, y: 540, width: 2500, height: 1180 },
  },
};
