// Ganti § jadi spasi
function parseWithSpasi(text) {
  return text.replace(/§/g, ' ').trim();
}

// Tambah + jika tidak diawali + atau 0
function formatPhoneNumber(num) {
  if (num.startsWith('+') || num.startsWith('0')) return num;
  return '+' + num;
}

// Preview isi file TXT
document.getElementById("txtFileInput").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    document.getElementById("numberTextArea").value = lines.join("\n");
    document.getElementById("totalNumberInfo").innerText = `Total nomor: ${lines.length}`;
  };
  reader.readAsText(file);
});

// Tombol Split VCF
document.getElementById("splitVCFButton").addEventListener("click", function () {
  const rawNumbers = document.getElementById("numberTextArea").value.trim();
  const nameBase = document.getElementById("contactNameInput").value.trim();
  const contactsPerFile = parseInt(document.getElementById("contactsPerFile").value) || 100;

  let startNumber = parseInt(document.getElementById("startNumberInput").value);
  if (isNaN(startNumber)) startNumber = 1; // boleh minus, default 1 kalau kosong

  const fileName = parseWithSpasi(document.getElementById("splitFileNameInput").value);
  const additionalFileName = parseWithSpasi(document.getElementById("additionalFileNameInput").value);
  const useCustomName = document.getElementById("customNameCheckbox").checked;

  if (!rawNumbers) {
    alert("Isi daftar nomor tidak boleh kosong.");
    return;
  }

  const numbers = rawNumbers
    .split(/\r?\n/)
    .map((n) => formatPhoneNumber(n.trim()))
    .filter((n) => n);

  const chunks = [];
  for (let i = 0; i < numbers.length; i += contactsPerFile) {
    chunks.push(numbers.slice(i, i + contactsPerFile));
  }

  const outputDiv = document.getElementById("splitVcfFiles");
  outputDiv.innerHTML = "";

  chunks.forEach((chunk, chunkIndex) => {
    const fileIndex = startNumber + chunkIndex;
    const currentFileName = `${fileName} ${fileIndex}${additionalFileName ? " " + additionalFileName : ""}`.trim();
    let vcfContent = "";

    chunk.forEach((number, idx) => {
      const localIndex = idx + 1;
      const globalIndex = chunkIndex * contactsPerFile + idx + 1;

      let contactName = "";

      if (useCustomName) {
        if (nameBase) {
          contactName = `${parseWithSpasi(nameBase)} ${fileName} ${fileIndex} ${additionalFileName} ${localIndex}`.trim();
        } else {
          contactName = `${fileName} ${fileIndex} ${additionalFileName} ${localIndex}`.trim();
        }
      } else {
        contactName = nameBase
          ? `${parseWithSpasi(nameBase)} ${globalIndex}`
          : `kontak ${globalIndex}`;
      }

      vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${number}\nEND:VCARD\n`;
    });

    const blob = new Blob([vcfContent], { type: "text/vcard" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${currentFileName}.vcf`;
    link.textContent = `Download ${link.download}`;
    outputDiv.appendChild(link);
    outputDiv.appendChild(document.createElement("br"));
  });

  console.log("Split VCF selesai.");
});
