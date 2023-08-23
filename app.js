const axios = require('axios');

// Define companies data
const companies = {
    ataKalip: {
        id: 1047126,
        donemId: 27942491,
        donemTxt: '01/01/2023 - 31/12/2023'
    },
    ata1Tasarim: {
        id: 1047157,
        donemId: 27949243,
        donemTxt: '01/01/2023 - 31/12/2023'
    },
    ciftrenk: {
        id: 1139480,
        donemId: 27949529,
        donemTxt: '01/01/2023 - 31/12/2023'
    }
};

// Define user login data
const userLogin = {
    musteriNo: '6188192',
    kullaniciAdi: 'ATAKLP',
    parola: 'ATAKLP123',
    dil: '1',
    opr: 'giris'
};

// Define bordro data
let ay;
let yil;
let personelId;
let bolumId;
let isyeriId;
let sirketId;

async function login() {

    const instance = axios.create();

    const initialURL = 'https://agiris.luca.com.tr/LUCASSO/giris.erp';

    let response;
    // Initial request
    try {
        response = await instance.get(initialURL);
    } catch (e) {
        console.error("Error during initial request:", e);
        throw e;
    }

    // Extract cookies
    let jsessionid = response.headers['set-cookie']
        .find(cookie => cookie.startsWith('JSESSIONID'))
        .split(';')[0]
        .split('=')[1];

    let wmonid = response.headers['set-cookie']
        .find(cookie => cookie.startsWith('WMONID'))
        .split(';')[0]
        .split('=')[1];

    let Cookie = `JSESSIONID=${jsessionid}; WMONID=${wmonid}`;

    // Construct the URL with jsessionid
    const actionURL = `${initialURL};jsessionid=${jsessionid}`;

    // Second request
    try {
        response = await instance.post(actionURL, userLogin, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': Cookie
            }
        });
    } catch (e) {
        console.error("Error during second request:", e);
        throw e;
    }

    // Extract required values from the response data
    const s_match = response.data.match(/f.s.value = '(.*?)';/);
    const t_match = response.data.match(/f.t.value = '(.*?)';/);

    const s_value = s_match ? s_match[1] : null;
    const t_value = t_match ? t_match[1] : null;

    const requestData = {
        s: s_value.toString(),
        t: t_value.toString()
    };


    // Third request
    try {
        response = await instance.post('https://auygs.luca.com.tr/Luca/ssoGiris.do', requestData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            withCredentials: true,
            maxRedirects: 0,
            validateStatus: function (status) {
                return status >= 200 && status < 303;
            },
        });
    } catch (e) {
        console.error("Error during third request:", e);
        throw e;
    }

    // Update cookies
    jsessionid = response.headers['set-cookie']
        .find(cookie => cookie.startsWith('JSESSIONID'))
        .split(';')[0]
        .split('=')[1]
        .toString();

    wmonid = response.headers['set-cookie']
        .find(cookie => cookie.startsWith('WMONID'))
        .split(';')[0]
        .split('=')[1]
        .toString();

    Cookie = `JSESSIONID=${jsessionid}; WMONID=${wmonid}`;



    // Fourth request
    try {
        response = await instance.get('https://auygs.luca.com.tr/Luca/listBolumBordro.do', {
            headers: {
                'Cookie': Cookie
            }
        });
    } catch (e) {
        console.error("Error during fourth request:", e);
        throw e;
    }

    // Extract company info from response data
    let regex = /<select name="isyeriId".*?><option value="(\d+)" selected="selected">/;
    isyeriId = response.data.match(regex);

    // Fifth request
    try {
        response = await instance.get('https://auygs.luca.com.tr/Luca/TopFrameAction.do', {
            headers: {
                'Cookie': Cookie
            }
        });
    } catch (e) {
        console.error("Error during fifth request:", e);
        throw e;
    }

    // Extract company ID from response data
    regex = /Find\(cacheObjSirket,(\d+)\);/;
    sirketId = response.data.match(regex);

    // Activate the company that is desired to be operated on
    if (sirketId[1] !== companies.ciftrenk.id.toString()) {
        // Sixth request
        try {
            await instance.get(`https://auygs.luca.com.tr/Luca/TopFrameAction.do?SIRKET_ID=${companies.ciftrenk.id}&DONEM_ID=${companies.ciftrenk.donemId}&DONEM_TXT=${companies.ciftrenk.donemTxt}`, {
                headers: {
                    'Cookie': Cookie
                }
            });
        } catch (e) {
            console.error("Error during switching companies:", e);
            throw e;
        }
    }

    // Function to add object to FormData
    function addObjectToFormData(formData, object) {
        for (let key in object) {
            if (object.hasOwnProperty(key)) {
                let value = object[key];

                if (Array.isArray(value)) {
                    // Eğer değer bir dizi ise her bir elemanı ayrı ayrı ekle
                    value.forEach(subObj => {
                        for (let subKey in subObj) {
                            formData.append(subKey, subObj[subKey]);
                        }
                    });
                } else if (typeof value === 'object' && value !== null) {
                    // Eğer değer bir obje (ama dizi değil) ise recursive olarak işlem yap
                    addObjectToFormData(formData, value);
                } else {
                    formData.append(key, value);
                }
            }
        }
    }

    // Define bordro data
    const bordroData = {
        ay: ay,
        yil: yil,
        personelId: personelId,
        bolumId: bolumId,
        isyeriId: isyeriId[1],
        bordroId: 1,
        bordroTipId: '',
        normal: [
            {
                normalId: 1,
                normalGun: 27.00,
                normalSaat: 202.50,
                normalUcret: 12060.00,
                normalNetBrut: 0,
            },
            {
                normalId: 2,
                normalGun: '',
                normalSaat: '',
                normalUcret: '',
                normalNetBrut: 0,
            },
            {
                normalId: 3,
                normalGun: '',
                normalSaat: '',
                normalUcret: '',
                normalNetBrut: 0,
            },
            {
                normalId: 4,
                normalGun: '',
                normalSaat: '',
                normalUcret: '',
                normalNetBrut: 0,
            },
            {
                normalId: 5,
                normalGun: 2.00,
                normalSaat: 15.00,
                normalUcret: '',
                normalNetBrut: 0,
            },

        ],
        eksikGun: 2.00,
        eksikSaat: '',
        eksikGunNeden: 1,
        uzaktanCalismaGun: 1,
        puantajGun: 31,
        argeGun: 0.00,
        argeSaat: 0.00,
        bolgeDisiArgeGun: '',
        bolgeDisiArgeSaat: '',
        fiiliHizmetGunu: '',
        bireyselEmeklilikIstisna: '',
        ozelSigortaIstisna: '',
        digerIstisna: '',
        keisnti: [
            {
                kesintiId: 501,
                kesinti: '',
            },
            {
                kesintiId: 502,
                kesinti: '',
            },
            {
                kesintiId: 503,
                kesinti: '',
            },
            {
                kesintiId: 506,
                kesinti: '',
            },
            {
                kesintiId: 507,
                kesinti: '',
            },
            {
                kesintiId: 571,
                kesinti: '',
            }
        ],
        ekKazanc: [
            {
                ekKazancId: 101,
                ucret: 0.00,
                katsayi: 1.50,
                ekUcretNeviDeger: 0,
                ikkNetBrut: 0,
                isgunu: 1,
                ekCarpan: 15.00,
                ekDeger: 1340.00,
                ekNetBrut: 0,
            },
            {
                ekKazancId: 102,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 0,
                ikkNetBrut: 0,
                isgunu: 1,
                ekCarpan: 2.00,
                ekDeger: 1234.00,
                ekNetBrut: 0,
            },
            {
                ekKazancId: 103,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 1,
                ikkNetBrut: 0,
                isgunu: 3,
                ekCarpan: 1.00,
                ekDeger: 333.00,
                ekNetBrut: 0,
            },
            {
                ekKazancId: 104,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 1,
                ikkNetBrut: 0,
                isgunu: 0,
                ekCarpan: 1.00,
                ekDeger: 222.00,
                ekNetBrut: 0,
            },
            {
                ekKazancId: 105,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 1,
                ikkNetBrut: 0,
                isgunu: 2,
                ekCarpan: 12.00,
                ekDeger: 223.00,
                ekNetBrut: 0,
            },
            {
                ekKazancId: 106,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 107,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 108,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 109,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 110,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 111,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 112,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 113,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 399,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 114,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 115,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 116,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 117,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 118,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 119,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 120,
                ucret: 0.00,
                katsayi: 2.00,
                ekUcretNeviDeger: 0,
                ikkNetBrut: 0,
                isgunu: 1,
                ekCarpan: '',
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 121,
                ucret: 0.00,
                katsayi: 2.00,
                ekUcretNeviDeger: 0,
                ikkNetBrut: 0,
                isgunu: 1,
                ekCarpan: '',
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 122,
                ucret: 0.00,
                katsayi: 2.00,
                ekUcretNeviDeger: 0,
                ikkNetBrut: 0,
                isgunu: 1,
                ekCarpan: '',
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 123,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 124,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 125,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 126,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 127,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 128,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 129,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 130,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 131,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 132,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 133,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 134,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 135,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 136,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 137,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 138,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 139,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 1,
                ikkNetBrut: 0,
                isgunu: 0,
                ekCarpan: '',
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 140,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 398,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
            {
                ekKazancId: 403,
                ucret: 0.00,
                katsayi: 0.00,
                ekUcretNeviDeger: 2,
                isgunu: 0,
                ekCarpan: 100.00,
                ekDeger: '',
                ekNetBrut: 0,
            },
        ],
    }


    // FormData nesnesi oluşturuluyor
    const formData2 = new FormData();
    addObjectToFormData(formData2, bordroData);


    // Final request
    try {
        response = await instance.post('https://auygs.luca.com.tr/Luca/updatePersonelBordroPuantajAction.do', formData2, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': Cookie
            }
        });
    } catch (e) {
        console.log('Error during final request:', e);
    }

    return response.data;
}

login().then(data => {
    console.log(data);
});