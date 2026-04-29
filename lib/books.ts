export interface Book {
  id: number;
  name_pt: string;
  abbreviation: string;
  testament: "AT" | "NT";
  total_chapters: number;
}

export const BOOKS: Book[] = [
  // Antigo Testamento
  { id: 1,  name_pt: "Gênesis",           abbreviation: "Gn",  testament: "AT", total_chapters: 50  },
  { id: 2,  name_pt: "Êxodo",             abbreviation: "Êx",  testament: "AT", total_chapters: 40  },
  { id: 3,  name_pt: "Levítico",          abbreviation: "Lv",  testament: "AT", total_chapters: 27  },
  { id: 4,  name_pt: "Números",           abbreviation: "Nm",  testament: "AT", total_chapters: 36  },
  { id: 5,  name_pt: "Deuteronômio",      abbreviation: "Dt",  testament: "AT", total_chapters: 34  },
  { id: 6,  name_pt: "Josué",             abbreviation: "Js",  testament: "AT", total_chapters: 24  },
  { id: 7,  name_pt: "Juízes",            abbreviation: "Jz",  testament: "AT", total_chapters: 21  },
  { id: 8,  name_pt: "Rute",              abbreviation: "Rt",  testament: "AT", total_chapters: 4   },
  { id: 9,  name_pt: "1 Samuel",          abbreviation: "1Sm", testament: "AT", total_chapters: 31  },
  { id: 10, name_pt: "2 Samuel",          abbreviation: "2Sm", testament: "AT", total_chapters: 24  },
  { id: 11, name_pt: "1 Reis",            abbreviation: "1Rs", testament: "AT", total_chapters: 22  },
  { id: 12, name_pt: "2 Reis",            abbreviation: "2Rs", testament: "AT", total_chapters: 25  },
  { id: 13, name_pt: "1 Crônicas",        abbreviation: "1Cr", testament: "AT", total_chapters: 29  },
  { id: 14, name_pt: "2 Crônicas",        abbreviation: "2Cr", testament: "AT", total_chapters: 36  },
  { id: 15, name_pt: "Esdras",            abbreviation: "Ed",  testament: "AT", total_chapters: 10  },
  { id: 16, name_pt: "Neemias",           abbreviation: "Ne",  testament: "AT", total_chapters: 13  },
  { id: 17, name_pt: "Ester",             abbreviation: "Et",  testament: "AT", total_chapters: 10  },
  { id: 18, name_pt: "Jó",               abbreviation: "Jó",  testament: "AT", total_chapters: 42  },
  { id: 19, name_pt: "Salmos",            abbreviation: "Sl",  testament: "AT", total_chapters: 150 },
  { id: 20, name_pt: "Provérbios",        abbreviation: "Pv",  testament: "AT", total_chapters: 31  },
  { id: 21, name_pt: "Eclesiastes",       abbreviation: "Ec",  testament: "AT", total_chapters: 12  },
  { id: 22, name_pt: "Cantares",          abbreviation: "Ct",  testament: "AT", total_chapters: 8   },
  { id: 23, name_pt: "Isaías",            abbreviation: "Is",  testament: "AT", total_chapters: 66  },
  { id: 24, name_pt: "Jeremias",          abbreviation: "Jr",  testament: "AT", total_chapters: 52  },
  { id: 25, name_pt: "Lamentações",       abbreviation: "Lm",  testament: "AT", total_chapters: 5   },
  { id: 26, name_pt: "Ezequiel",          abbreviation: "Ez",  testament: "AT", total_chapters: 48  },
  { id: 27, name_pt: "Daniel",            abbreviation: "Dn",  testament: "AT", total_chapters: 12  },
  { id: 28, name_pt: "Oseias",            abbreviation: "Os",  testament: "AT", total_chapters: 14  },
  { id: 29, name_pt: "Joel",              abbreviation: "Jl",  testament: "AT", total_chapters: 3   },
  { id: 30, name_pt: "Amós",              abbreviation: "Am",  testament: "AT", total_chapters: 9   },
  { id: 31, name_pt: "Obadias",           abbreviation: "Ob",  testament: "AT", total_chapters: 1   },
  { id: 32, name_pt: "Jonas",             abbreviation: "Jn",  testament: "AT", total_chapters: 4   },
  { id: 33, name_pt: "Miquéias",          abbreviation: "Mq",  testament: "AT", total_chapters: 7   },
  { id: 34, name_pt: "Naum",              abbreviation: "Na",  testament: "AT", total_chapters: 3   },
  { id: 35, name_pt: "Habacuque",         abbreviation: "Hc",  testament: "AT", total_chapters: 3   },
  { id: 36, name_pt: "Sofonias",          abbreviation: "Sf",  testament: "AT", total_chapters: 3   },
  { id: 37, name_pt: "Ageu",              abbreviation: "Ag",  testament: "AT", total_chapters: 2   },
  { id: 38, name_pt: "Zacarias",          abbreviation: "Zc",  testament: "AT", total_chapters: 14  },
  { id: 39, name_pt: "Malaquias",         abbreviation: "Ml",  testament: "AT", total_chapters: 4   },
  // Novo Testamento
  { id: 40, name_pt: "Mateus",            abbreviation: "Mt",  testament: "NT", total_chapters: 28  },
  { id: 41, name_pt: "Marcos",            abbreviation: "Mc",  testament: "NT", total_chapters: 16  },
  { id: 42, name_pt: "Lucas",             abbreviation: "Lc",  testament: "NT", total_chapters: 24  },
  { id: 43, name_pt: "João",              abbreviation: "Jo",  testament: "NT", total_chapters: 21  },
  { id: 44, name_pt: "Atos",              abbreviation: "At",  testament: "NT", total_chapters: 28  },
  { id: 45, name_pt: "Romanos",           abbreviation: "Rm",  testament: "NT", total_chapters: 16  },
  { id: 46, name_pt: "1 Coríntios",       abbreviation: "1Co", testament: "NT", total_chapters: 16  },
  { id: 47, name_pt: "2 Coríntios",       abbreviation: "2Co", testament: "NT", total_chapters: 13  },
  { id: 48, name_pt: "Gálatas",           abbreviation: "Gl",  testament: "NT", total_chapters: 6   },
  { id: 49, name_pt: "Efésios",           abbreviation: "Ef",  testament: "NT", total_chapters: 6   },
  { id: 50, name_pt: "Filipenses",        abbreviation: "Fp",  testament: "NT", total_chapters: 4   },
  { id: 51, name_pt: "Colossenses",       abbreviation: "Cl",  testament: "NT", total_chapters: 4   },
  { id: 52, name_pt: "1 Tessalonicenses", abbreviation: "1Ts", testament: "NT", total_chapters: 5   },
  { id: 53, name_pt: "2 Tessalonicenses", abbreviation: "2Ts", testament: "NT", total_chapters: 3   },
  { id: 54, name_pt: "1 Timóteo",         abbreviation: "1Tm", testament: "NT", total_chapters: 6   },
  { id: 55, name_pt: "2 Timóteo",         abbreviation: "2Tm", testament: "NT", total_chapters: 4   },
  { id: 56, name_pt: "Tito",              abbreviation: "Tt",  testament: "NT", total_chapters: 3   },
  { id: 57, name_pt: "Filemom",           abbreviation: "Fm",  testament: "NT", total_chapters: 1   },
  { id: 58, name_pt: "Hebreus",           abbreviation: "Hb",  testament: "NT", total_chapters: 13  },
  { id: 59, name_pt: "Tiago",             abbreviation: "Tg",  testament: "NT", total_chapters: 5   },
  { id: 60, name_pt: "1 Pedro",           abbreviation: "1Pe", testament: "NT", total_chapters: 5   },
  { id: 61, name_pt: "2 Pedro",           abbreviation: "2Pe", testament: "NT", total_chapters: 3   },
  { id: 62, name_pt: "1 João",            abbreviation: "1Jo", testament: "NT", total_chapters: 5   },
  { id: 63, name_pt: "2 João",            abbreviation: "2Jo", testament: "NT", total_chapters: 1   },
  { id: 64, name_pt: "3 João",            abbreviation: "3Jo", testament: "NT", total_chapters: 1   },
  { id: 65, name_pt: "Judas",             abbreviation: "Jd",  testament: "NT", total_chapters: 1   },
  { id: 66, name_pt: "Apocalipse",        abbreviation: "Ap",  testament: "NT", total_chapters: 22  },
];

export const AT_BOOKS = BOOKS.filter((b) => b.testament === "AT");
export const NT_BOOKS = BOOKS.filter((b) => b.testament === "NT");

export function getBook(id: number): Book | undefined {
  return BOOKS.find((b) => b.id === id);
}
