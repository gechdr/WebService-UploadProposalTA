const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect DB
const Sequelize = require("sequelize");
const { QueryTypes } = require("sequelize");
const conn = new Sequelize("t2_6958", "root", "", {
	host: "localhost",
	dialect: "mysql",
	logging: false, //debugging
});

// Functions

function isValidDateSlash(date) {
	if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) return false;

	var tempDate = date.split("/");
	if (tempDate.length == 0) {
		return false;
	}

	var day = parseInt(tempDate[0], 10);
	var month = parseInt(tempDate[1], 10);
	var year = parseInt(tempDate[2], 10);

	if (year < 1000 || year > 3000 || month <= 0 || month > 12) return false;

	var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) monthLength[1] = 29;

	return day > 0 && day <= monthLength[month - 1];
}

function isValidDateDash(date) {
	if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) return false;

	var tempDate = date.split("/");
	if (tempDate.length == 0) {
		return false;
	}

	var day = parseInt(tempDate[0], 10);
	var month = parseInt(tempDate[1], 10);
	var year = parseInt(tempDate[2], 10);

	if (year < 1000 || year > 3000 || month <= 0 || month > 12) return false;

	var monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) monthLength[1] = 29;

	return day > 0 && day <= monthLength[month - 1];
}

async function generateUserID() {
	let [tempUsers, metadata] = await conn.query("SELECT * FROM mahasiswa");

	let lastID = "";
	tempUsers.forEach((user) => {
		lastID = user.id_mhs;
	});

	if (tempUsers.length < 1) {
		lastID = "000";
	}

	let tempID = lastID.substring(3);
	tempID++;
	let newID = "MHS" + tempID.toString().padStart(3, "0");

	return newID.toString();
}

async function generateLecturerID() {
	let [tempLecturers, metadata] = await conn.query("SELECT * FROM lecturers");

	let lastID = "";
	tempLecturers.forEach((lecturer) => {
		lastID = lecturer.id_lecturer;
	});

	if (tempLecturers.length < 1) {
		lastID = "000";
	}

	let tempID = lastID.substring(3);
	tempID++;
	let newID = "DOS" + tempID.toString().padStart(3, "0");

	return newID.toString();
}

function isValidPeriode(periode) {
	if (!/^[0-9]{6}$/.test(periode)) {
		return false;
	}

	var year = periode.substr(0, 4);
	var month = periode.substr(4, 2);

	if (isNaN(year) || isNaN(month) || year < 1900 || year > 2100 || month < 1 || month > 12) {
		return false;
	}

	return true;
}

async function generateProposalID() {
	let [tempProposal, metadata] = await conn.query("SELECT * FROM proposals");

	let lastID = "";
	tempProposal.forEach((proposal) => {
		lastID = proposal.id_proposal;
	});

	if (tempProposal.length < 1) {
		lastID = "000";
	}

	let tempID = lastID.substring(3);
	tempID++;
	let newID = "PTA" + tempID.toString().padStart(3, "0");

	return newID.toString();
}

async function getInRangeProposal(periode_min, periode_max) {
    let [dataProposal,metadata] = await conn.query(`SELECT * FROM proposals`);

	var tempResult = [];
    dataProposal.forEach(proposal => {
        var periode = proposal.periode;
		if (periode >= periode_min && periode <= periode_max) {
			tempResult.push(proposal);
		}
    });

	return tempResult;
}

// Points
// 1
app.post("/api/users", async (req, res) => {
	let { nrp, nama_lengkap, jurusan, email, jenis_kelamin, tanggal_lahir } = req.body;

	// Empty Input
	if (!nrp || !nama_lengkap || !jurusan || !email || !jenis_kelamin || !tanggal_lahir) {
		return res.status(400).send({
			message: "Field tidak sesuai ketentuan!",
		});
	}

	// Valid NRP
	if (nrp.length != 9) {
		return res.status(400).send({
			message: "Field tidak sesuai ketentuan!",
		});
	}

	// Check Duplicate NRP
	let tempNRP = `%${nrp}%`;
	let similarNRP = await conn.query(`SELECT * FROM mahasiswa WHERE nrp like ?`, {
		type: QueryTypes.SELECT,
		replacements: [tempNRP],
	});

	if (similarNRP.length != 0) {
		return res.status(400).send({
			message: "NRP sudah terdaftar!",
		});
	}

	// Valid DOB
	if (!isValidDateSlash(tanggal_lahir)) {
		return res.status(400).send({
			message: "Tanggal lahir tidak valid!",
		});
	}

	// Valid Gender
	if (jenis_kelamin.toLowerCase() != "l" && jenis_kelamin.toLowerCase() != "p") {
		return res.status(400).send({
			message: "Jenis kelamin tidak valid!",
		});
	}
	jenis_kelamin = jenis_kelamin.toUpperCase();

	// Generate ID
	let id_mhs = await generateUserID();

	// Insert
	let [result, metadata] = await conn.query(`INSERT INTO mahasiswa (id_mhs,nrp,nama_lengkap,jurusan,email,jenis_kelamin,tanggal_lahir) values (:id_mhs,:nrp,:nama_lengkap,:jurusan,:email,:jenis_kelamin,:tanggal_lahir)`, {
		replacements: {
			id_mhs: id_mhs,
			nrp: nrp,
			nama_lengkap: nama_lengkap,
			jurusan: jurusan,
			email: email,
			jenis_kelamin: jenis_kelamin,
			tanggal_lahir: tanggal_lahir,
		},
	});

	// OK
	return res.status(201).send({
		id: id_mhs,
		nrp: nrp,
		nama_lengkap: nama_lengkap,
		email: email,
	});
});

// 2
app.post("/api/lecturers", async (req, res) => {
	let { nama_lengkap, email, jenis_kelamin } = req.body;

	// Empty Input
	if (!nama_lengkap || !email || !jenis_kelamin) {
		return res.status(400).send({
			message: "Field tidak sesuai ketentuan!",
		});
	}

	// Valid Gender
	if (jenis_kelamin.toLowerCase() != "l" && jenis_kelamin.toLowerCase() != "p") {
		return res.status(400).send({
			message: "Jenis kelamin tidak valid!",
		});
	}
	jenis_kelamin = jenis_kelamin.toUpperCase();

	// Generate ID
	let id_lecturer = await generateLecturerID();

	// Insert
	let [result, metadata] = await conn.query(`INSERT INTO lecturers (id_lecturer,nama_lengkap,email,jenis_kelamin) values (:id_lecturer,:nama_lengkap,:email,:jenis_kelamin)`, {
		replacements: {
			id_lecturer: id_lecturer,
			nama_lengkap: nama_lengkap,
			email: email,
			jenis_kelamin: jenis_kelamin,
		},
	});

	// OK
	return res.status(201).send({
		id: id_lecturer,
		nama_lengkap: nama_lengkap,
		email: email,
	});
});

// 3
app.post("/api/proposals", async (req, res) => {
	let { judul_ta, id_mhs, id_pembimbing, id_co_pembimbing, periode } = req.body;

	// Empty Input
	if (!judul_ta || !id_mhs || !id_pembimbing || !id_co_pembimbing || !periode) {
		return res.status(400).send({
			message: "Field tidak sesuai ketentuan!",
		});
	}

	// Valid Periode
	if (isValidPeriode(periode) == false) {
		return res.status(400).send({
			message: "Field tidak sesuai ketentuan!",
		});
	}

	// Check Duplicate Judul_TA
	let tempJudul = `%${judul_ta}%`;
	let similarJudul = await conn.query(`SELECT * FROM proposals WHERE judul_ta like ?`, {
		type: QueryTypes.SELECT,
		replacements: [tempJudul],
	});

	if (similarJudul.length != 0) {
		return res.status(400).send({
			message: "Judul tidak unik!",
		});
	}

	// Mahasiswa Exist
	let tempMhsID = `%${id_mhs}%`;
	let similarMhs = await conn.query(`SELECT * FROM mahasiswa WHERE id_mhs like ?`, {
		type: QueryTypes.SELECT,
		replacements: [tempMhsID],
	});

	if (similarMhs.length == 0) {
		return res.status(404).send({
			message: "Mahasiswa tidak ditemukan!",
		});
	}

	// Dosen Exist
	let tempDosenID = `%${id_pembimbing}%`;
	let tempDosenID2 = `%${id_co_pembimbing}%`;
	let similarDosen = await conn.query(`SELECT * FROM lecturers WHERE id_lecturer like ?`, {
		type: QueryTypes.SELECT,
		replacements: [tempDosenID],
	});
	let similarDosen2 = await conn.query(`SELECT * FROM lecturers WHERE id_lecturer like ?`, {
		type: QueryTypes.SELECT,
		replacements: [tempDosenID2],
	});

	if (similarDosen.length == 0 || similarDosen2.length == 0) {
		return res.status(404).send({
			message: "Dosen tidak ditemukan!",
		});
	}

	// Generate ID
	let id_proposal = await generateProposalID();

	// Insert
	let status = "PENDING";
	let [result, metadata] = await conn.query(`INSERT INTO proposals (id_proposal,judul_ta,id_mhs,id_pembimbing,id_co_pembimbing,periode,status) values (:id_proposal,:judul_ta,:id_mhs,:id_pembimbing,:id_co_pembimbing,:periode,:status)`, {
		replacements: {
			id_proposal: id_proposal,
			judul_ta: judul_ta,
			id_mhs: id_mhs,
			id_pembimbing: id_pembimbing,
			id_co_pembimbing,
			id_co_pembimbing,
			periode: periode,
			status: status,
		},
	});

	// Get Data Mahasiswa & Dosen
	let tempMahasiswa = await conn.query(`SELECT * FROM mahasiswa WHERE id_mhs = ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_mhs],
	});
	let mahasiswa_name = "";
	tempMahasiswa.forEach((mhs) => {
		mahasiswa_name = mhs.nama_lengkap;
	});

	let tempDosen1 = await conn.query(`SELECT * FROM lecturers WHERE id_lecturer = ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_pembimbing],
	});
	let tempDosen2 = await conn.query(`SELECT * FROM lecturers WHERE id_lecturer = ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_co_pembimbing],
	});
	let dosen1_name, dosen2_name;
	tempDosen1.forEach((dosen) => {
		dosen1_name = dosen.nama_lengkap;
	});
	tempDosen2.forEach((dosen) => {
		dosen2_name = dosen.nama_lengkap;
	});

	// OK
	return res.status(201).send({
		id_proposal: id_proposal,
		mahasiswa: mahasiswa_name,
		pembimbing: dosen1_name,
		co_pembimbing: dosen2_name,
		periode: periode,
		status: status,
	});
});

// 4
app.get("/api/lecturers/:id_dosen", async (req, res) => {
	let { id_dosen } = req.params;

	// Empty Input
	if (!id_dosen) {
		return res.status(400).send({
			message: "Field tidak sesuai ketentuan!",
		});
	}

	// Valid ID
	let similarDosen = await conn.query(`SELECT * FROM lecturers WHERE id_lecturer = ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_dosen],
	});

	if (similarDosen.length == 0) {
		return res.status(404).send({
			message: "Dosen tidak ditemukan!",
		});
	}

	// Get Dosen Data
	let tempDosen = await conn.query(`SELECT * FROM lecturers WHERE id_lecturer like ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_dosen],
	});
	let nama_lengkap, email;
	tempDosen.forEach((dosen) => {
		nama_lengkap = dosen.nama_lengkap;
		email = dosen.email;
	});

	// Get Proposal Data
	let tempProposal = await conn.query(`SELECT * FROM proposals WHERE id_pembimbing = ? OR id_co_pembimbing = ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_dosen, id_dosen],
	});

	let resultProposal = [];
	tempProposal.forEach((proposal) => {
		let id_proposal = proposal.id_proposal;
		let judul_ta = proposal.judul_ta;

		let newResult = {
			id: id_proposal,
			judul: judul_ta,
		};
		resultProposal.push(newResult);
	});

	// OK
	return res.status(200).send({
		nama_lengkap: nama_lengkap,
		email: email,
		proposal_bimbingan: resultProposal,
	});
});
app.get("/api/lecturers", async (req, res) => {
	let { keyword } = req.query;

	// Empty Input
	if (!keyword) {
		return res.status(400).send({
			message: "Field tidak sesuai ketentuan!",
		});
	}

	// Searching
	let tempNama = `%${keyword}%`;
	let similarDosen = await conn.query(`SELECT * FROM lecturers WHERE nama_lengkap like ?`, {
		type: QueryTypes.SELECT,
		replacements: [tempNama],
	});

	let result = [];
	similarDosen.forEach((dosen) => {
		id_dosen = dosen.id_lecturer;
		nama_lengkap = dosen.nama_lengkap;

		let newResult = {
			id: id_dosen,
			nama_lengkap: nama_lengkap,
		};
		result.push(newResult);
	});

	// OK
	return res.status(200).send({
		dosen: result,
	});
});

// 5
app.put("/api/proposals/:id_proposal", async (req, res) => {
	let { id_proposal } = req.params;
	let { id_dosen, status, komentar } = req.body;

	// Empty Input
	if (!id_proposal || !id_dosen || !status) {
		return res.status(400).send({
			message: "Field tidak sesuai ketentuan!",
		});
	}

	// Valid Proposal
	let tempProposal = await conn.query(`SELECT * FROM proposals WHERE id_proposal = ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_proposal],
	});

	if (tempProposal.length == 0) {
		return res.status(404).send({
			message: "Proposal tidak ditemukan!",
		});
	}

	// Valid Dosen
	let tempDosen = await conn.query(`SELECT * FROM lecturers WHERE id_lecturer = ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_dosen],
	});

	if (tempDosen.length == 0) {
		return res.status(404).send({
			message: "Dosen tidak ditemukan!",
		});
	}

	tempDosen = await conn.query(`SELECT * FROM proposals WHERE (id_pembimbing = ? OR id_co_pembimbing = ?) AND id_proposal = ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_dosen, id_dosen, id_proposal],
	});

	if (tempDosen.length == 0) {
		return res.status(400).send({
			message: "Dosen tidak membimbing proposal ini!",
		});
	}

	// Valid Status
	status = status.toUpperCase();
	if (status != "REVISI" && status != "DITOLAK" && status != "DITERIMA") {
		return res.status(400).send({
			message: "Status tidak valid!",
		});
	}

	// Update
	let [result, metadata] = await conn.query(`UPDATE proposals SET status = :status WHERE id_proposal = :id_proposal`, {
		replacements: {
			status: status,
			id_proposal: id_proposal,
		},
	});
	if (komentar) {
		let [result, metadata] = await conn.query(`UPDATE proposals SET comment = :komentar WHERE id_proposal = :id_proposal`, {
			replacements: {
				komentar: komentar,
				id_proposal: id_proposal,
			},
		});
	}

	// Get Data
	tempProposal = await conn.query(`SELECT * FROM proposals WHERE id_proposal = ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_proposal],
	});

	let judul_ta, statusProposal, komentarProposal;
	tempProposal.forEach((proposal) => {
		judul_ta = proposal.judul_ta;
		statusProposal = proposal.status;
		komentarProposal = proposal.comment;
	});

	// OK
	if (komentarProposal) {
		return res.status(200).send({
			id_proposal: id_proposal,
			judul: judul_ta,
			status: statusProposal,
			komentar: komentarProposal,
		});
	} else {
		return res.status(200).send({
			id_proposal: id_proposal,
			judul: judul_ta,
			status: statusProposal,
		});
	}
});

// 6
app.get("/api/proposals/:id_proposal", async (req, res) => {
	let { id_proposal } = req.params;

	// Empty Input
	if (!id_proposal) {
		return res.status(400).send({
			message: "Field tidak sesuai ketentuan!",
		});
	}

	// Valid Proposal
	let tempProposal = await conn.query(`SELECT * FROM proposals WHERE id_proposal = ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_proposal],
	});

	if (tempProposal.length == 0) {
		return res.status(404).send({
			message: "Proposal tidak ditemukan!",
		});
	}

	// Get Data
	let judul_ta, id_mhs, mahasiswa_name, id_dosen1, pembimbing_name, id_dosen2, co_pembimbing_name, periode, status, komentar;
	tempProposal.forEach((proposal) => {
		judul_ta = proposal.judul_ta;
		id_mhs = proposal.id_mhs;
		id_dosen1 = proposal.id_pembimbing;
		id_dosen2 = proposal.id_co_pembimbing;
		periode = proposal.periode;
		status = proposal.status;
		komentar = proposal.comment;
	});

	let tempMahasiswa = await conn.query(`SELECT * FROM mahasiswa WHERE id_mhs = ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_mhs],
	});
	tempMahasiswa.forEach((mhs) => {
		mahasiswa_name = mhs.nama_lengkap;
	});

	let tempDosen1 = await conn.query(`SELECT * FROM lecturers WHERE id_lecturer = ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_dosen1],
	});
	tempDosen1.forEach((dosen) => {
		pembimbing_name = dosen.nama_lengkap;
	});

	let tempDosen2 = await conn.query(`SELECT * FROM lecturers WHERE id_lecturer = ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_dosen2],
	});
	tempDosen2.forEach((dosen) => {
		co_pembimbing_name = dosen.nama_lengkap;
	});

	if (komentar) {
		return res.status(200).send({
			id_proposal: id_proposal,
			judul: judul_ta,
			mahasiswa: mahasiswa_name,
			pembimbing: pembimbing_name,
			co_pembimbing: co_pembimbing_name,
			periode: periode,
			status: status,
			komentar: komentar,
		});
	} else {
		return res.status(200).send({
			id_proposal: id_proposal,
			judul: judul_ta,
			mahasiswa: mahasiswa_name,
			pembimbing: pembimbing_name,
			co_pembimbing: co_pembimbing_name,
			periode: periode,
			status: status,
		});
	}
});
app.get("/api/proposals", async (req, res) => {
	let { periode_min, periode_max, judul } = req.query;

	if (!judul) {
		// Periode

		// Empty Input
		if (!periode_min || !periode_max) {
			return res.status(400).send({
				message: "Field tidak sesuai ketentuan!",
			});
		}

        // Valid Periode
        if (periode_max < periode_min) {
            return res.status(400).send({
				message: "Field tidak sesuai ketentuan!",
			});
        }

        // Searching
        let tempProposal = await getInRangeProposal(periode_min, periode_max);

        if (tempProposal.length == 0) {
            return res.status(404).send({
                message: "Proposal tidak ditemukan!"
            })
        }
        
        let result = [];
        tempProposal.forEach(proposal => {
            id_proposal = proposal.id_proposal;
            judul_ta = proposal.judul_ta;
            periode = proposal.periode;

            let tempResult = {
                id: id_proposal,
                judul: judul_ta,
                periode: periode
            }
            result.push(tempResult);
        });

        return res.status(200).send({
            proposal: result
        });
	} else {
		// Judul

        // Searching
        let tempJudul = `%${judul}%`;
	    let similarProposal = await conn.query(`SELECT * FROM proposals WHERE judul_ta like ?`, {
		    type: QueryTypes.SELECT,
		    replacements: [tempJudul],
	    });

        if (similarProposal.length == 0) {
            return res.status(404).send({
                message: "Proposal tidak ditemukan!"
            })
        }

        let result = [];
        similarProposal.forEach(proposal => {
            id_proposal = proposal.id_proposal;
            judul_ta = proposal.judul_ta;
            periode = proposal.periode;

            let tempResult = {
                id: id_proposal,
                judul: judul_ta,
                periode: periode
            }
            result.push(tempResult);
        });

        return res.status(200).send({
            proposal: result
        });
	}
});

// 7
app.delete("/api/proposals/:id_proposal", async (req, res) => {
    let {id_proposal} = req.params;

    // Empty Input
	if (!id_proposal) {
		return res.status(400).send({
			message: "Field tidak sesuai ketentuan!",
		});
	}

    // Searching
    let tempProposal = await conn.query(`SELECT * FROM proposals WHERE id_proposal = ?`, {
		type: QueryTypes.SELECT,
		replacements: [id_proposal],
	});

	if (tempProposal.length == 0) {
		return res.status(404).send({
			message: "Proposal tidak ditemukan!",
		});
	}

    // Get Data
    let judul_ta;
    tempProposal.forEach(proposal => {
        judul_ta = proposal.judul_ta;
    });

    // Delete
    let deleteProposal = await conn.query(`DELETE FROM proposals WHERE id_proposal = ?`,{
            replacements: [id_proposal]
        }
    )

    // OK
    return res.status(200).send({
        id_proposal: id_proposal,
        judul: judul_ta,
        message: "Proposal berhasil dihapus!"
    })
});

// Initiation
const initApp = async () => {
	try {
		await conn.authenticate();
		console.log("Database Connected!");
		app.listen(port, () => console.log(`App listening on port ${port}!`));
	} catch (error) {
		console.error("Failure database connection : ", error.original);
	}
};

initApp();
