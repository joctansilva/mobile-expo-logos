import type Database from 'better-sqlite3';

interface BookData {
  id: number;
  name_pt: string;
  name_en: string;
  abbr: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

export const BOOKS: BookData[] = [
  // ─── AT — Old Testament ────────────────────────────────────────────────────
  { id:  1, name_pt: 'Gênesis',           name_en: 'Genesis',          abbr: 'Gn',  testament: 'OT', chapters: 50  },
  { id:  2, name_pt: 'Êxodo',             name_en: 'Exodus',           abbr: 'Êx', testament: 'OT', chapters: 40  },
  { id:  3, name_pt: 'Levítico',          name_en: 'Leviticus',        abbr: 'Lv',  testament: 'OT', chapters: 27  },
  { id:  4, name_pt: 'Números',           name_en: 'Numbers',          abbr: 'Nm',  testament: 'OT', chapters: 36  },
  { id:  5, name_pt: 'Deuteronômio',      name_en: 'Deuteronomy',      abbr: 'Dt',  testament: 'OT', chapters: 34  },
  { id:  6, name_pt: 'Josué',             name_en: 'Joshua',           abbr: 'Js',  testament: 'OT', chapters: 24  },
  { id:  7, name_pt: 'Juízes',            name_en: 'Judges',           abbr: 'Jz',  testament: 'OT', chapters: 21  },
  { id:  8, name_pt: 'Rute',              name_en: 'Ruth',             abbr: 'Rt',  testament: 'OT', chapters: 4   },
  { id:  9, name_pt: '1 Samuel',          name_en: '1 Samuel',         abbr: '1Sm', testament: 'OT', chapters: 31  },
  { id: 10, name_pt: '2 Samuel',          name_en: '2 Samuel',         abbr: '2Sm', testament: 'OT', chapters: 24  },
  { id: 11, name_pt: '1 Reis',            name_en: '1 Kings',          abbr: '1Rs', testament: 'OT', chapters: 22  },
  { id: 12, name_pt: '2 Reis',            name_en: '2 Kings',          abbr: '2Rs', testament: 'OT', chapters: 25  },
  { id: 13, name_pt: '1 Crônicas',        name_en: '1 Chronicles',     abbr: '1Cr', testament: 'OT', chapters: 29  },
  { id: 14, name_pt: '2 Crônicas',        name_en: '2 Chronicles',     abbr: '2Cr', testament: 'OT', chapters: 36  },
  { id: 15, name_pt: 'Esdras',            name_en: 'Ezra',             abbr: 'Ed',  testament: 'OT', chapters: 10  },
  { id: 16, name_pt: 'Neemias',           name_en: 'Nehemiah',         abbr: 'Ne',  testament: 'OT', chapters: 13  },
  { id: 17, name_pt: 'Ester',             name_en: 'Esther',           abbr: 'Et',  testament: 'OT', chapters: 10  },
  { id: 18, name_pt: 'Jó',               name_en: 'Job',              abbr: 'Jó',  testament: 'OT', chapters: 42  },
  { id: 19, name_pt: 'Salmos',            name_en: 'Psalms',           abbr: 'Sl',  testament: 'OT', chapters: 150 },
  { id: 20, name_pt: 'Provérbios',        name_en: 'Proverbs',         abbr: 'Pv',  testament: 'OT', chapters: 31  },
  { id: 21, name_pt: 'Eclesiastes',       name_en: 'Ecclesiastes',     abbr: 'Ec',  testament: 'OT', chapters: 12  },
  { id: 22, name_pt: 'Cantares',          name_en: 'Song of Solomon',  abbr: 'Ct',  testament: 'OT', chapters: 8   },
  { id: 23, name_pt: 'Isaías',            name_en: 'Isaiah',           abbr: 'Is',  testament: 'OT', chapters: 66  },
  { id: 24, name_pt: 'Jeremias',          name_en: 'Jeremiah',         abbr: 'Jr',  testament: 'OT', chapters: 52  },
  { id: 25, name_pt: 'Lamentações',       name_en: 'Lamentations',     abbr: 'Lm',  testament: 'OT', chapters: 5   },
  { id: 26, name_pt: 'Ezequiel',          name_en: 'Ezekiel',          abbr: 'Ez',  testament: 'OT', chapters: 48  },
  { id: 27, name_pt: 'Daniel',            name_en: 'Daniel',           abbr: 'Dn',  testament: 'OT', chapters: 12  },
  { id: 28, name_pt: 'Oséias',            name_en: 'Hosea',            abbr: 'Os',  testament: 'OT', chapters: 14  },
  { id: 29, name_pt: 'Joel',              name_en: 'Joel',             abbr: 'Jl',  testament: 'OT', chapters: 3   },
  { id: 30, name_pt: 'Amós',              name_en: 'Amos',             abbr: 'Am',  testament: 'OT', chapters: 9   },
  { id: 31, name_pt: 'Obadias',           name_en: 'Obadiah',          abbr: 'Ob',  testament: 'OT', chapters: 1   },
  { id: 32, name_pt: 'Jonas',             name_en: 'Jonah',            abbr: 'Jn',  testament: 'OT', chapters: 4   },
  { id: 33, name_pt: 'Miquéias',          name_en: 'Micah',            abbr: 'Mq',  testament: 'OT', chapters: 7   },
  { id: 34, name_pt: 'Naum',              name_en: 'Nahum',            abbr: 'Na',  testament: 'OT', chapters: 3   },
  { id: 35, name_pt: 'Habacuque',         name_en: 'Habakkuk',         abbr: 'Hc',  testament: 'OT', chapters: 3   },
  { id: 36, name_pt: 'Sofonias',          name_en: 'Zephaniah',        abbr: 'Sf',  testament: 'OT', chapters: 3   },
  { id: 37, name_pt: 'Ageu',              name_en: 'Haggai',           abbr: 'Ag',  testament: 'OT', chapters: 2   },
  { id: 38, name_pt: 'Zacarias',          name_en: 'Zechariah',        abbr: 'Zc',  testament: 'OT', chapters: 14  },
  { id: 39, name_pt: 'Malaquias',         name_en: 'Malachi',          abbr: 'Ml',  testament: 'OT', chapters: 4   },
  // ─── NT — New Testament ────────────────────────────────────────────────────
  { id: 40, name_pt: 'Mateus',            name_en: 'Matthew',          abbr: 'Mt',  testament: 'NT', chapters: 28  },
  { id: 41, name_pt: 'Marcos',            name_en: 'Mark',             abbr: 'Mc',  testament: 'NT', chapters: 16  },
  { id: 42, name_pt: 'Lucas',             name_en: 'Luke',             abbr: 'Lc',  testament: 'NT', chapters: 24  },
  { id: 43, name_pt: 'João',              name_en: 'John',             abbr: 'Jo',  testament: 'NT', chapters: 21  },
  { id: 44, name_pt: 'Atos',              name_en: 'Acts',             abbr: 'At',  testament: 'NT', chapters: 28  },
  { id: 45, name_pt: 'Romanos',           name_en: 'Romans',           abbr: 'Rm',  testament: 'NT', chapters: 16  },
  { id: 46, name_pt: '1 Coríntios',       name_en: '1 Corinthians',    abbr: '1Co', testament: 'NT', chapters: 16  },
  { id: 47, name_pt: '2 Coríntios',       name_en: '2 Corinthians',    abbr: '2Co', testament: 'NT', chapters: 13  },
  { id: 48, name_pt: 'Gálatas',           name_en: 'Galatians',        abbr: 'Gl',  testament: 'NT', chapters: 6   },
  { id: 49, name_pt: 'Efésios',           name_en: 'Ephesians',        abbr: 'Ef',  testament: 'NT', chapters: 6   },
  { id: 50, name_pt: 'Filipenses',        name_en: 'Philippians',      abbr: 'Fp',  testament: 'NT', chapters: 4   },
  { id: 51, name_pt: 'Colossenses',       name_en: 'Colossians',       abbr: 'Cl',  testament: 'NT', chapters: 4   },
  { id: 52, name_pt: '1 Tessalonicenses', name_en: '1 Thessalonians',  abbr: '1Ts', testament: 'NT', chapters: 5   },
  { id: 53, name_pt: '2 Tessalonicenses', name_en: '2 Thessalonians',  abbr: '2Ts', testament: 'NT', chapters: 3   },
  { id: 54, name_pt: '1 Timóteo',         name_en: '1 Timothy',        abbr: '1Tm', testament: 'NT', chapters: 6   },
  { id: 55, name_pt: '2 Timóteo',         name_en: '2 Timothy',        abbr: '2Tm', testament: 'NT', chapters: 4   },
  { id: 56, name_pt: 'Tito',              name_en: 'Titus',            abbr: 'Tt',  testament: 'NT', chapters: 3   },
  { id: 57, name_pt: 'Filemom',           name_en: 'Philemon',         abbr: 'Fm',  testament: 'NT', chapters: 1   },
  { id: 58, name_pt: 'Hebreus',           name_en: 'Hebrews',          abbr: 'Hb',  testament: 'NT', chapters: 13  },
  { id: 59, name_pt: 'Tiago',             name_en: 'James',            abbr: 'Tg',  testament: 'NT', chapters: 5   },
  { id: 60, name_pt: '1 Pedro',           name_en: '1 Peter',          abbr: '1Pe', testament: 'NT', chapters: 5   },
  { id: 61, name_pt: '2 Pedro',           name_en: '2 Peter',          abbr: '2Pe', testament: 'NT', chapters: 3   },
  { id: 62, name_pt: '1 João',            name_en: '1 John',           abbr: '1Jo', testament: 'NT', chapters: 5   },
  { id: 63, name_pt: '2 João',            name_en: '2 John',           abbr: '2Jo', testament: 'NT', chapters: 1   },
  { id: 64, name_pt: '3 João',            name_en: '3 John',           abbr: '3Jo', testament: 'NT', chapters: 1   },
  { id: 65, name_pt: 'Judas',             name_en: 'Jude',             abbr: 'Jd',  testament: 'NT', chapters: 1   },
  { id: 66, name_pt: 'Apocalipse',        name_en: 'Revelation',       abbr: 'Ap',  testament: 'NT', chapters: 22  },
];

export function importBooks(db: Database.Database) {
  const stmt = db.prepare(
    `INSERT INTO books (id, name_pt, name_en, abbreviation, testament, total_chapters)
     VALUES (@id, @name_pt, @name_en, @abbreviation, @testament, @total_chapters)`
  );

  const insertAll = db.transaction(() => {
    for (const book of BOOKS) {
      stmt.run({
        id: book.id,
        name_pt: book.name_pt,
        name_en: book.name_en,
        abbreviation: book.abbr,
        testament: book.testament,
        total_chapters: book.chapters,
      });
    }
  });

  insertAll();
  console.log(`  → ${BOOKS.length} livros inseridos`);
}
