export default class DigitDisplay {
    constructor() {
        // Init
        this.segmentMap = {
            a: null,
            b: null,
            c: null,
            d: null,
            e: null,
            f: null,
            g: null,
        };

        this.intCache = {};
    }

    /**
     * Assigns the digit 1 sequence characters to the default map, the 'cf' part
     * @param sequence random 2 character sequence
     */
    set1(sequence) {
        this.segmentMap.c = sequence[0];
        this.segmentMap.f = sequence[1];
    }

    /**
     * Assigns the digit 4 sequence characters to the default map not including the 1 characters, the 'bd' part
     * @param sequence random 4 character sequence
     */
    set4(sequence) {
        const bd = this.removeCharactersFromString(sequence, this.get1());
        this.segmentMap.b = bd[0];
        this.segmentMap.d = bd[1];
    }

    /**
     * Assigns the digit 7 sequence characters to the default map not including the 1 characters, the 'a' part
     * @param sequence random 3 character sequence
     */
    set7(sequence) {
        this.segmentMap.a = this.removeCharactersFromString(sequence, this.get1());
    }

    /**
     * Assigns the digit 8 sequence characters to the default map not including the 1.4,7 characters, the 'eg' part
     * @param sequence random 7 character sequence
     */
    set8(sequence) {
        const charactersToRemove = this.get1() + this.get4() + this.get7();
        const eg = this.removeCharactersFromString(sequence, charactersToRemove);
        this.segmentMap.e = eg[0];
        this.segmentMap.g = eg[1];
    }

    get0() {
        const zero = this.segmentMap.a +
            this.segmentMap.b +
            this.segmentMap.c +
            this.segmentMap.e +
            this.segmentMap.f +
            this.segmentMap.g;
        return this.sortAlphabetic(zero);
    }

    get1() {
        const one = this.segmentMap.c +
            this.segmentMap.f;
        return this.sortAlphabetic(one);
    }

    get2() {
        const two = this.segmentMap.a +
            this.segmentMap.c +
            this.segmentMap.d +
            this.segmentMap.e +
            this.segmentMap.g;
        return this.sortAlphabetic(two);
    }

    get3() {
        const three = this.segmentMap.a +
            this.segmentMap.c +
            this.segmentMap.d +
            this.segmentMap.f +
            this.segmentMap.g;
        return this.sortAlphabetic(three);
    }

    get4() {
        const four = this.segmentMap.b +
            this.segmentMap.c +
            this.segmentMap.d +
            this.segmentMap.f;
        return this.sortAlphabetic(four);
    }

    get5() {
        const five = this.segmentMap.a +
            this.segmentMap.b +
            this.segmentMap.d +
            this.segmentMap.f +
            this.segmentMap.g;
        return this.sortAlphabetic(five);
    }

    get6() {
        const six = this.segmentMap.a +
            this.segmentMap.b +
            this.segmentMap.d +
            this.segmentMap.e +
            this.segmentMap.f +
            this.segmentMap.g;
        return this.sortAlphabetic(six);
    }

    get7() {
        const seven = this.segmentMap.a +
            this.segmentMap.c +
            this.segmentMap.f;
        return this.sortAlphabetic(seven);
    }

    get8() {
        const eight = this.segmentMap.a +
            this.segmentMap.b +
            this.segmentMap.c +
            this.segmentMap.d +
            this.segmentMap.e +
            this.segmentMap.f +
            this.segmentMap.g;
        return this.sortAlphabetic(eight);
    }

    get9() {
        const nine = this.segmentMap.a +
            this.segmentMap.b +
            this.segmentMap.c +
            this.segmentMap.d +
            this.segmentMap.f +
            this.segmentMap.g;
        return this.sortAlphabetic(nine);
    }

    /**
     * Tune the sequence map from a 6 character digit string which only include the numbers 0 and 6,
     * based on this we can lock-in all but the other digits except the number 5 which we're still not sure about,
     * but can easily account for later.
     */
    tuneSixCharacterDigit(sequence) {
        if (sequence.length !== 6) {
            return;
        }

        // sort input alphabetically
        sequence = this.sortAlphabetic(sequence);

        const sequenceTranslated = this.translate(sequence);

        if (sequenceTranslated === 'acdefg') {
            // Invalid zero sequence, need to swap 'bd' segments
            const t = this.segmentMap.b;
            this.segmentMap.b = this.segmentMap.d;
            this.segmentMap.d = t;
        }
        else if (sequenceTranslated === 'abcdeg') {
            // invalid six sequence, need to swap 'cf' segments
            const t = this.segmentMap.c;
            this.segmentMap.c = this.segmentMap.f;
            this.segmentMap.f = t;
        }
        else if (sequenceTranslated === 'abcdef') {
            // Invalid Nine sequence, need to swap 'eg' segments
            const t = this.segmentMap.e;
            this.segmentMap.e = this.segmentMap.g;
            this.segmentMap.g = t;
        }
    }

    /**
     * Removes charaters from stringA that are found in stringB
     * @param stringA string to be modified
     * @param stringB string of characters to be removed from stringA
     * @return {*}
     */
    removeCharactersFromString(stringA, stringB) {
        const pattern = `[${stringB}]`;
        const regEx = new RegExp(pattern, 'g');
        return stringA.replace(regEx, '');
    }

    sortAlphabetic(string) {
        return string.split('').sort().join('');
    }

    translate(sequence) {
        sequence = this.sortAlphabetic(sequence);
        let translatedSequence = '';

        for (const [key, value] of Object.entries(this.segmentMap)) {
            if (sequence.includes(value)) {
                translatedSequence += key;
            }
        }

        return this.sortAlphabetic(translatedSequence);
    }

    generateIntCache() {
        this.intCache[this.get0()] = 0;
        this.intCache[this.get1()] = 1;
        this.intCache[this.get2()] = 2;
        this.intCache[this.get3()] = 3;
        this.intCache[this.get4()] = 4;
        this.intCache[this.get5()] = 5;
        this.intCache[this.get6()] = 6;
        this.intCache[this.get7()] = 7;
        this.intCache[this.get8()] = 8;
        this.intCache[this.get9()] = 9;
    }

    decode(sequence) {
        sequence = this.sortAlphabetic(sequence);
        this.generateIntCache();
        return this.intCache[sequence];
    }
}
