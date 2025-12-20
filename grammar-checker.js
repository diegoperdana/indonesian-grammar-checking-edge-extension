// Indonesian Grammar Checker Module
// Contains rules and patterns for Bahasa Indonesia grammar checking
// Berdasarkan KBBI dan SPOK (Subjek-Predikat-Objek-Keterangan)

class IndonesianGrammarChecker {
    constructor() {
        this.errors = [];
        this.initRules();
        this.initTransitiveVerbs();
        this.initPlaceWords();
    }

    // Daftar verba transitif umum (untuk deteksi "di-" awalan verba pasif)
    initTransitiveVerbs() {
        this.transitiveVerbs = new Set([
            // Verba transitif umum
            'lakukan', 'ambil', 'hukum', 'tulis', 'buat', 'atur', 'atas', 'ikuti', 
            'perlukan', 'sediakan', 'berikan', 'tentukan', 'pilih', 'kenal', 'capai', 
            'kembangkan', 'gunakan', 'percaya', 'tunjukkan', 'mulai', 'akhiri', 'lepas', 
            'belikan', 'suruh', 'tanya', 'minta', 'jawab', 'katakan', 'peroleh', 'ciptakan',
            'dengar', 'lihat', 'rasa', 'ingat','rinya', 'pahami', 'pelajari', 'ubah', 'tambah', 
            'kurang', 'buang', 'simpan', 'antar', 'ajar', 'beri', 'bantu', 'bimbing', 
            'bina', 'dukung', 'dorong', 'ganti', 'gesa', 'godok', 'golekkan', 'gosok', 
            'gratis', 'gratiskan', 'gubris', 'gugat', 'gulung', 'gumam', 'gunting', 
            'gurami', 'gurat', 'guri', 'gurinda', 'gurita', 'gusar', 'gusur', 'gutil', 
            'guyang',
            // Verba transitif tambahan
            'baca', 'bawa', 'pukul', 'panggil', 'panggil', 'kirim', 'terima', 'tolak',
            'terima', 'tolak', 'tolong', 'tolong', 'tolong', 'tolong', 'tolong', 'tolong',
            'hitung', 'ukur', 'timbang', 'timbang', 'timbang', 'timbang', 'timbang',
            'cari', 'temukan','buka', 'tutup',
            'masuk', 'keluar','angkat', 'turun','putar', 'henti',
            // Verba dengan akhiran -kan, -i
            'lakukan', 'buatkan', 'tuliskan', 'bacakan', 'berikan', 'tunjukkan',
            'ajarkan', 'bantukan', 'kirimkan', 'terimakan', 'tolakkan', 'hitungkan',
            'ukuri', 'timbangi', 'carikan', 'temukan', 'bukakan', 'tutupkan',
            'masukkan', 'keluarkan', 'angkatkan', 'turunkan', 'putarkan', 'hentikan'
        ]);
    }

    // Daftar kata yang menunjukkan tempat (untuk deteksi "di" preposisi)
    initPlaceWords() {
        this.placeWords = new Set([
            'rumah', 'sekolah', 'kantor', 'pasar', 'jalan', 'taman', 'depan', 'belakang',
            'atas', 'bawah', 'samping', 'dalam', 'luar', 'tengah', 'antara', 'sekitar',
            'jakarta', 'bandung', 'surabaya', 'yogyakarta', 'medan', 'makassar', 
            'semarang', 'palembang', 'denpasar', 'bali', 'sumatra', 'jawa', 'kalimantan',
            'sulawesi', 'papua', 'indonesia',
            'meja', 'kursi', 'kamar', 'ruangan', 'gedung', 'bangunan', 'tempat',
            'kota', 'desa', 'negara', 'provinsi', 'kabupaten', 'kecamatan',
            'panggung', 'kertas', 'lapangan', 'gudang', 'toko', 'mall', 'restoran',
            'kafe', 'hotel', 'rumah sakit', 'sekolah', 'universitas', 'kampus'
        ]);
    }

    // Fungsi untuk mendeteksi apakah "di" adalah awalan verba pasif atau preposisi
    isDiPrefixVerb(text, diIndex) {
        // Ambil kata setelah "di"
        const afterDi = text.substring(diIndex + 2).trim();
        const firstWord = afterDi.split(/\s+/)[0].toLowerCase();
        
        // Hapus akhiran -kan, -i, -an untuk cek kata dasar
        let baseWord = firstWord;
        if (baseWord.endsWith('kan')) {
            baseWord = baseWord.slice(0, -3);
        } else if (baseWord.endsWith('i')) {
            baseWord = baseWord.slice(0, -1);
        } else if (baseWord.endsWith('an')) {
            baseWord = baseWord.slice(0, -2);
        }
        
        // Cek apakah kata dasar adalah verba transitif
        if (this.transitiveVerbs.has(baseWord) || this.transitiveVerbs.has(firstWord)) {
            return true; // "di" adalah awalan verba pasif
        }
        
        // Cek apakah kata setelah "di" adalah kata tempat
        if (this.placeWords.has(firstWord)) {
            return false; // "di" adalah preposisi
        }
        
        // Cek konteks: jika setelah "di" ada kata yang bisa menjadi verba
        // dan ada objek setelahnya, kemungkinan besar adalah verba pasif
        const context = afterDi.substring(0, 50).toLowerCase();
        const hasObject = /\s+(oleh|dari|untuk|kepada|dengan)\s+/.test(context);
        if (hasObject) {
            return true; // Kemungkinan verba pasif
        }
        
        // Default: jika tidak jelas, anggap sebagai preposisi (lebih aman)
        return false;
    }

    initRules() {
        // Aturan tata bahasa Indonesia berdasarkan KBBI dan SPOK
        this.rules = {
            // 1. STRUKTUR KALIMAT (SPOK)
            structure: {
                // Kata depan sebelum subjek (kesalahan umum)
                prepositionBeforeSubject: {
                    pattern: /\b(bagi|untuk|kepada|dari|oleh)\s+([a-z\s]+)\s+(ini|itu|tersebut|harus|perlu|wajib)\b/gi,
                    message: "Hindari penggunaan kata depan sebelum subjek. Subjek sebaiknya tidak didahului kata depan",
                    severity: "warning",
                    category: "struktur",
                    rule: "SPOK - Subjek tidak boleh didahului kata depan",
                    explanation: "Menurut aturan SPOK, subjek tidak boleh didahului kata depan seperti 'bagi', 'untuk', 'kepada'"
                },
                // Objek yang didahului kata depan (salah)
                objectWithPreposition: {
                    pattern: /\b(di|ke|dari|pada|dengan|untuk|kepada|oleh)\s+([a-z]+)\s+(yang|ini|itu)\s+([a-z]+)\b/gi,
                    message: "Objek tidak boleh didahului kata depan",
                    severity: "error",
                    category: "struktur",
                    rule: "SPOK - Objek tidak didahului kata depan"
                }
            },

            // 2. PENGGUNAAN KATA BERIMBUHAN
            affixes: {
                // Awalan yang terpisah (salah) - kecuali "di" yang akan dicek terpisah
                separatedPrefixes: [
                    {
                        pattern: /\b(me|ber|ter|pe)\s+([a-z]{2,})\b/gi,
                        message: "Awalan 'me-', 'ber-', 'ter-', 'pe-' harus SERANGKAI dengan kata dasar",
                        severity: "error",
                        category: "imbuhan",
                        rule: "KBBI - Awalan harus serangkai",
                        suggestion: (match) => {
                            const prefix = match[1].toLowerCase();
                            const word = match[2].toLowerCase();
                            return `${prefix}${word}`;
                        },
                        explanation: "Menurut KBBI, awalan harus ditulis serangkai dengan kata dasar"
                    }
                ],
                // Akhiran yang terpisah (salah)
                separatedSuffixes: [
                    {
                        pattern: /\b([a-z]{2,})\s+(kan|i|an|nya)\b/gi,
                        message: "Akhiran '-kan', '-i', '-an', '-nya' harus SERANGKAI dengan kata dasar",
                        severity: "error",
                        category: "imbuhan",
                        rule: "KBBI - Akhiran harus serangkai",
                        suggestion: (match) => {
                            const word = match[1].toLowerCase();
                            const suffix = match[2].toLowerCase();
                            return `${word}${suffix}`;
                        },
                        explanation: "Menurut KBBI, akhiran harus ditulis serangkai dengan kata dasar"
                    }
                ],
                // Konfiks yang terpisah
                separatedConfixes: [
                    {
                        pattern: /\b(ke|pe|per|me)\s+([a-z]{2,})\s+(an|kan)\b/gi,
                        message: "Konfiks 'ke-an', 'pe-an', 'per-an', 'me-kan' harus SERANGKAI",
                        severity: "error",
                        category: "imbuhan",
                        rule: "KBBI - Konfiks harus serangkai",
                        explanation: "Menurut KBBI, konfiks harus ditulis serangkai"
                    }
                ]
            },

            // 3. PENGGUNAAN KATA DEPAN "DI" - DIPERTAJAM
            prepositionsDi: {
                // "di" yang salah terpisah (seharusnya serangkai sebagai awalan verba pasif)
                // Ini akan dicek dengan fungsi khusus
                
                // "di" yang salah serangkai (seharusnya terpisah sebagai preposisi)
                // Pattern untuk "di" + kata tempat yang tertulis serangkai
                check: (text) => {
                    const issues = [];
                    // Cari semua "di" yang diikuti kata (tanpa spasi)
                    const pattern = /\bdi([a-z]{2,})\b/gi;
                    let match;
                    
                    while ((match = pattern.exec(text)) !== null) {
                        const diIndex = match.index;
                        const wordAfterDi = match[1].toLowerCase();
                        
                        // Cek apakah ini adalah verba pasif (harus serangkai - BENAR)
                        if (this.isDiPrefixVerb(text, diIndex)) {
                            // Ini benar, jangan flag sebagai error
                            continue;
                        }
                        
                        // Cek apakah ini adalah kata tempat (harus terpisah - SALAH jika serangkai)
                        if (this.placeWords.has(wordAfterDi)) {
                            issues.push({
                                index: match.index,
                                length: match[0].length,
                                message: `Kata depan 'di' harus TERPISAH dari kata tempat '${wordAfterDi}'`,
                                severity: "error",
                                category: "kata-depan",
                                rule: "KBBI - Kata depan 'di' untuk tempat harus terpisah",
                                suggestion: `di ${wordAfterDi}`,
                                explanation: `Menurut KBBI, kata depan 'di' yang menunjukkan tempat harus ditulis terpisah. Contoh: "di ${wordAfterDi}" bukan "di${wordAfterDi}"`
                            });
                        } else {
                            // Cek apakah kata setelah "di" kemungkinan adalah tempat
                            // dengan melihat konteks kalimat
                            const context = text.substring(Math.max(0, diIndex - 20), Math.min(text.length, diIndex + 50));
                            const placeIndicators = /\b(di|ke|dari|pada)\s+(rumah|sekolah|kantor|tempat|jakarta|bandung|surabaya|indonesia|meja|kursi|kamar|ruangan|gedung|bangunan|kota|desa|negara|provinsi|kabupaten|kecamatan|panggung|kertas|lapangan|gudang|toko|mall|restoran|kafe|hotel|rumah sakit|universitas|kampus)\b/gi;
                            
                            if (placeIndicators.test(context)) {
                                // Kemungkinan besar adalah preposisi tempat yang salah serangkai
                                issues.push({
                                    index: match.index,
                                    length: match[0].length,
                                    message: `Kata depan 'di' kemungkinan harus TERPISAH dari '${wordAfterDi}' (menunjukkan tempat)`,
                                    severity: "warning",
                                    category: "kata-depan",
                                    rule: "KBBI - Kata depan 'di' untuk tempat harus terpisah",
                                    suggestion: `di ${wordAfterDi}`,
                                    explanation: "Jika 'di' menunjukkan tempat, harus ditulis terpisah"
                                });
                            }
                        }
                    }
                    
                    return issues;
                }
            },

            // 4. PENGGUNAAN KATA DEPAN LAINNYA (Selain DI)
            prepositionsOther: {
                // Kata depan yang salah serangkai
                check: (text) => {
                    const issues = [];
                    const prepositions = ['ke', 'dari', 'dalam', 'pada', 'untuk', 'kepada', 'oleh', 'tanpa', 'dengan'];
                    const placeWords = ['rumah', 'sekolah', 'kantor', 'pasar', 'jalan', 'taman', 'jakarta', 'bandung', 'surabaya', 'indonesia', 'meja', 'kursi', 'kamar', 'ruangan'];
                    
                    prepositions.forEach(prep => {
                        // Cek "ke-" sebagai awalan (kehilangan, keberuntungan) - harus serangkai
                        if (prep === 'ke') {
                            const kePrefixPattern = /\bke([a-z]{3,})\b/gi;
                            let match;
                            while ((match = kePrefixPattern.exec(text)) !== null) {
                                const wordAfterKe = match[1].toLowerCase();
                                // Jika bukan kata tempat dan bukan awalan yang benar, flag
                                if (!placeWords.includes(wordAfterKe) && 
                                    !['hilangan', 'beruntungan', 'beradaan', 'beradaan'].some(w => wordAfterKe.includes(w))) {
                                    // Bisa jadi salah, tapi skip dulu karena "ke-" bisa awalan
                                    continue;
                                }
                            }
                        }
                        
                        // Cek kata depan yang salah serangkai dengan kata tempat
                        const pattern = new RegExp(`\\b${prep}(rumah|sekolah|kantor|pasar|jalan|taman|jakarta|bandung|surabaya|indonesia|meja|kursi|kamar|ruangan)\\b`, 'gi');
                        let match;
                        while ((match = pattern.exec(text)) !== null) {
                            issues.push({
                                index: match.index,
                                length: match[0].length,
                                message: `Kata depan '${prep}' harus TERPISAH dari kata yang mengikutinya`,
                                severity: "error",
                                category: "kata-depan",
                                rule: `KBBI - Kata depan '${prep}' harus terpisah`,
                                suggestion: `${prep} ${match[1]}`,
                                explanation: `Menurut KBBI, kata depan '${prep}' harus ditulis terpisah dari kata yang mengikutinya`
                            });
                        }
                    });
                    
                    return issues;
                }
            },

            // 5. PENGGUNAAN TANDA BACA (PUEBI)
            punctuation: {
                // Koma sebelum konjungsi yang salah
                commaBeforeConjunction: {
                    pattern: /,\s*(dan|atau|tetapi|melainkan)\s+[a-z]/gi,
                    message: "Tanda koma tidak diperlukan sebelum konjungsi jika induk kalimat mendahului anak kalimat",
                    severity: "warning",
                    category: "tanda-baca",
                    rule: "PUEBI - Penggunaan koma sebelum konjungsi"
                },
                // Tanda titik yang hilang di akhir kalimat
                missingPeriod: {
                    pattern: /[a-z]\s+[A-Z]/g,
                    check: (match, text) => {
                        const before = text.substring(Math.max(0, match.index - 10), match.index);
                        if (!/[.!?;:]/.test(before)) {
                            return {
                                message: "Mungkin perlu tanda titik (.) sebelum kalimat baru",
                                severity: "suggestion",
                                category: "tanda-baca",
                                rule: "PUEBI - Tanda titik di akhir kalimat"
                            };
                        }
                        return null;
                    }
                }
            },

            // 6. KALIMAT EFEKTIF
            effectiveness: {
                // Pengulangan kata yang tidak perlu
                unnecessaryRepetition: [
                    {
                        pattern: /\b(sudah|telah)\s+(sudah|telah)\b/gi,
                        message: "Penggunaan ganda 'sudah' atau 'telah' tidak diperlukan",
                        severity: "error",
                        category: "efektivitas",
                        rule: "Kalimat Efektif - Hindari pengulangan"
                    },
                    {
                        pattern: /\b(akan|hendak)\s+(akan|hendak)\b/gi,
                        message: "Penggunaan ganda 'akan' atau 'hendak' tidak diperlukan",
                        severity: "error",
                        category: "efektivitas"
                    },
                    {
                        pattern: /\b(saya|aku|kita|kami)\s+(saya|aku|kita|kami)\b/gi,
                        message: "Penggunaan ganda kata ganti tidak diperlukan",
                        severity: "warning",
                        category: "efektivitas"
                    },
                    {
                        pattern: /\b(yang|bahwa)\s+(yang|bahwa)\b/gi,
                        message: "Penggunaan ganda 'yang' atau 'bahwa' mungkin tidak diperlukan",
                        severity: "warning",
                        category: "efektivitas"
                    },
                    {
                        pattern: /\b(pun)\s+(pun)\b/gi,
                        message: "Penggunaan ganda 'pun' tidak diperlukan",
                        severity: "error",
                        category: "efektivitas"
                    }
                ],
                // Keparalelan bentuk
                parallelism: {
                    pattern: /\b([a-z]+(?:kan|i)?)\s*,\s*([a-z]+(?:kan|i)?)\s*,\s*(dan|atau)\s+([a-z]+(?:an|kan|i)?)\b/gi,
                    check: (match) => {
                        const forms = [match[1], match[2], match[4]];
                        const hasKan = forms.some(f => f.endsWith('kan'));
                        const hasI = forms.some(f => f.endsWith('i'));
                        const hasAn = forms.some(f => f.endsWith('an'));
                        
                        if ((hasKan && !forms.every(f => f.endsWith('kan'))) ||
                            (hasI && !forms.every(f => f.endsWith('i'))) ||
                            (hasAn && !forms.every(f => f.endsWith('an')))) {
                            return {
                                message: "Unsur setara harus menggunakan pola kata yang sama (keparalelan)",
                                severity: "warning",
                                category: "efektivitas",
                                rule: "Kalimat Efektif - Keparalelan bentuk",
                                explanation: "Unsur-unsur yang setara dalam kalimat harus menggunakan pola kata yang sama"
                            };
                        }
                        return null;
                    }
                }
            },

            // 7. KONJUNGSI
            conjunctions: {
                // Konjungsi yang salah digunakan
                wrongConjunction: {
                    pattern: /\b(karena|sebab)\s+(maka|sehingga)\b/gi,
                    message: "Hindari penggunaan 'karena/sebab' dengan 'maka/sehingga' secara bersamaan",
                    severity: "warning",
                    category: "konjungsi",
                    rule: "KBBI - Penggunaan konjungsi"
                }
            },

            // 8. SPASI DAN FORMAT
            spacing: {
                doubleSpaces: /\s{2,}/g
            },

            // 9. KAPITALISASI
            capitalization: {
                placeNames: {
                    pattern: /\b([a-z]+)\s+(indonesia|jakarta|surabaya|bandung|yogyakarta|medan|makassar|semarang|palembang|denpasar|bali|sumatra|jawa|kalimantan|sulawesi|papua)\b/gi,
                    message: "Nama tempat harus diawali huruf kapital",
                    severity: "error",
                    category: "diksi",
                    rule: "PUEBI - Kapitalisasi nama tempat"
                }
            }
        };
    }

    // Check text for grammar errors
    checkText(text) {
        this.errors = [];
        
        if (!text || text.trim().length === 0) {
            return this.errors;
        }

        try {
            // 1. Check struktur kalimat (SPOK)
            this.checkStructure(text);
            
            // 2. Check kata berimbuhan
            this.checkAffixes(text);
            
            // 3. Check kata depan "di" (dengan logika khusus)
            this.checkPrepositionsDi(text);
            
            // 4. Check kata depan lainnya
            this.checkPrepositionsOther(text);
            
            // 5. Check tanda baca
            this.checkPunctuation(text);
            
            // 6. Check kalimat efektif
            this.checkEffectiveness(text);
            
            // 7. Check konjungsi
            this.checkConjunctions(text);
            
            // 8. Check spasi
            this.checkSpacing(text);
            
            // 9. Check kapitalisasi
            this.checkCapitalization(text);
        } catch (error) {
            console.warn('Error during grammar checking:', error);
        }

        return this.errors;
    }

    // 1. Check struktur kalimat (SPOK)
    checkStructure(text) {
        try {
            // Kata depan sebelum subjek
            const matches = [...text.matchAll(this.rules.structure.prepositionBeforeSubject.pattern)];
            matches.forEach(match => {
                this.errors.push({
                    index: match.index,
                    length: match[0].length,
                    message: this.rules.structure.prepositionBeforeSubject.message,
                    severity: this.rules.structure.prepositionBeforeSubject.severity,
                    category: this.rules.structure.prepositionBeforeSubject.category,
                    rule: this.rules.structure.prepositionBeforeSubject.rule,
                    explanation: this.rules.structure.prepositionBeforeSubject.explanation
                });
            });
        } catch (error) {
            console.warn('Error checking structure:', error);
        }
    }

    // 2. Check kata berimbuhan
    checkAffixes(text) {
        try {
            // Check awalan terpisah
            this.rules.affixes.separatedPrefixes.forEach(rule => {
                const matches = [...text.matchAll(rule.pattern)];
                matches.forEach(match => {
                    const suggestion = rule.suggestion ? rule.suggestion(match) : null;
                    this.errors.push({
                        index: match.index,
                        length: match[0].length,
                        message: rule.message,
                        severity: rule.severity,
                        category: rule.category,
                        rule: rule.rule,
                        suggestion: suggestion,
                        explanation: rule.explanation
                    });
                });
            });

            // Check akhiran terpisah
            this.rules.affixes.separatedSuffixes.forEach(rule => {
                const matches = [...text.matchAll(rule.pattern)];
                matches.forEach(match => {
                    const suggestion = rule.suggestion ? rule.suggestion(match) : null;
                    this.errors.push({
                        index: match.index,
                        length: match[0].length,
                        message: rule.message,
                        severity: rule.severity,
                        category: rule.category,
                        rule: rule.rule,
                        suggestion: suggestion,
                        explanation: rule.explanation
                    });
                });
            });

            // Check konfiks terpisah
            this.rules.affixes.separatedConfixes.forEach(rule => {
                const matches = [...text.matchAll(rule.pattern)];
                matches.forEach(match => {
                    this.errors.push({
                        index: match.index,
                        length: match[0].length,
                        message: rule.message,
                        severity: rule.severity,
                        category: rule.category,
                        rule: rule.rule,
                        explanation: rule.explanation
                    });
                });
            });
        } catch (error) {
            console.warn('Error checking affixes:', error);
        }
    }

    // 3. Check kata depan "di" (dengan logika khusus)
    checkPrepositionsDi(text) {
        try {
            const issues = this.rules.prepositionsDi.check(text);
            this.errors.push(...issues);
        } catch (error) {
            console.warn('Error checking prepositions "di":', error);
        }
    }

    // 4. Check kata depan lainnya
    checkPrepositionsOther(text) {
        try {
            const issues = this.rules.prepositionsOther.check(text);
            this.errors.push(...issues);
        } catch (error) {
            console.warn('Error checking other prepositions:', error);
        }
    }

    // 5. Check tanda baca
    checkPunctuation(text) {
        try {
            // Koma sebelum konjungsi
            const commaMatches = [...text.matchAll(this.rules.punctuation.commaBeforeConjunction.pattern)];
            commaMatches.forEach(match => {
                this.errors.push({
                    index: match.index,
                    length: match[0].length,
                    message: this.rules.punctuation.commaBeforeConjunction.message,
                    severity: this.rules.punctuation.commaBeforeConjunction.severity,
                    category: this.rules.punctuation.commaBeforeConjunction.category,
                    rule: this.rules.punctuation.commaBeforeConjunction.rule
                });
            });
        } catch (error) {
            console.warn('Error checking punctuation:', error);
        }
    }

    // 6. Check kalimat efektif
    checkEffectiveness(text) {
        try {
            // Pengulangan yang tidak perlu
            this.rules.effectiveness.unnecessaryRepetition.forEach(rule => {
                const matches = [...text.matchAll(rule.pattern)];
                matches.forEach(match => {
                    this.errors.push({
                        index: match.index,
                        length: match[0].length,
                        message: rule.message,
                        severity: rule.severity,
                        category: rule.category,
                        rule: rule.rule || "Kalimat Efektif"
                    });
                });
            });

            // Keparalelan bentuk
            const parallelismMatches = [...text.matchAll(this.rules.effectiveness.parallelism.pattern)];
            parallelismMatches.forEach(match => {
                const result = this.rules.effectiveness.parallelism.check(match);
                if (result) {
                    this.errors.push({
                        index: match.index,
                        length: match[0].length,
                        message: result.message,
                        severity: result.severity,
                        category: result.category,
                        rule: result.rule,
                        explanation: result.explanation
                    });
                }
            });
        } catch (error) {
            console.warn('Error checking effectiveness:', error);
        }
    }

    // 7. Check konjungsi
    checkConjunctions(text) {
        try {
            const matches = [...text.matchAll(this.rules.conjunctions.wrongConjunction.pattern)];
            matches.forEach(match => {
                this.errors.push({
                    index: match.index,
                    length: match[0].length,
                    message: this.rules.conjunctions.wrongConjunction.message,
                    severity: this.rules.conjunctions.wrongConjunction.severity,
                    category: this.rules.conjunctions.wrongConjunction.category,
                    rule: this.rules.conjunctions.wrongConjunction.rule
                });
            });
        } catch (error) {
            console.warn('Error checking conjunctions:', error);
        }
    }

    // 8. Check spasi
    checkSpacing(text) {
        try {
            const matches = [...text.matchAll(this.rules.spacing.doubleSpaces)];
            matches.forEach(match => {
                this.errors.push({
                    index: match.index,
                    length: match[0].length,
                    message: "Spasi ganda tidak diperlukan",
                    severity: "warning",
                    category: "format",
                    suggestion: " ",
                    rule: "PUEBI - Spasi"
                });
            });
        } catch (error) {
            console.warn('Error checking spacing:', error);
        }
    }

    // 9. Check kapitalisasi
    checkCapitalization(text) {
        try {
            const matches = [...text.matchAll(this.rules.capitalization.placeNames.pattern)];
            matches.forEach(match => {
                if (match[1] && match[2]) {
                    this.errors.push({
                        index: match.index + match[1].length + 1,
                        length: match[2].length,
                        message: this.rules.capitalization.placeNames.message,
                        severity: this.rules.capitalization.placeNames.severity,
                        category: this.rules.capitalization.placeNames.category,
                        rule: this.rules.capitalization.placeNames.rule,
                        suggestion: match[2].charAt(0).toUpperCase() + match[2].slice(1)
                    });
                }
            });
        } catch (error) {
            console.warn('Error checking capitalization:', error);
        }
    }

    // Get suggestions for fixing errors
    getSuggestions(text, error) {
        const suggestions = [];
        
        if (error.suggestion) {
            suggestions.push(error.suggestion);
        }

        // Add more intelligent suggestions based on error category
        if (error.category === "kata-depan" && error.message.includes("TERPISAH")) {
            const errorText = text.substring(error.index, error.index + error.length);
            const fixed = errorText.replace(/(di|ke|dari)([a-z]+)/i, '$1 $2');
            if (fixed !== errorText) {
                suggestions.push(fixed);
            }
        }

        if (error.category === "imbuhan") {
            const errorText = text.substring(error.index, error.index + error.length);
            const fixed = errorText.replace(/\s+/g, '');
            if (fixed !== errorText) {
                suggestions.push(fixed);
            }
        }

        return suggestions;
    }

    // Helper method untuk mendapatkan kategori error
    getCategory(error) {
        return error.category || "umum";
    }

    // Helper method untuk mendapatkan rule yang dilanggar
    getRule(error) {
        return error.rule || "Aturan umum tata bahasa Indonesia";
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndonesianGrammarChecker;
}
