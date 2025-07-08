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

document.getElementById("splitVCFButton").addEventListener("click", function () {
  const rawNumbers = document.getElementById("numberTextArea").value.trim();
  const nameBase = document.getElementById("contactNameInput").value.trim();
  const contactsPerFile = parseInt(document.getElementById("contactsPerFile").value) || 100;
  const startNumber = parseInt(document.getElementById("startNumberInput").value) || 1;
  const fileName = document.getElementById("splitFileNameInput").value.trim();
  const additionalFileName = document.getElementById("additionalFileNameInput").value.trim();
  const useCustomName = document.getElementById("customNameCheckbox").checked;

  if (!rawNumbers) {
    alert("Isi daftar nomor tidak boleh kosong.");
    return;
  }

  const numbers = rawNumbers
    .split(/\r?\n/)
    .map((n) => n.trim())
    .filter((n) => n);

  const chunks = [];
  for (let i = 0; i < numbers.length; i += contactsPerFile) {
    chunks.push(numbers.slice(i, i + contactsPerFile));
  }

  const outputDiv = document.getElementById("splitVcfFiles");
  outputDiv.innerHTML = "";

  chunks.forEach((chunk, chunkIndex) => {
    const fileIndex = startNumber + chunkIndex;
    const currentFileName = `${fileName || fileIndex}${additionalFileName ? " " + additionalFileName : ""}`;
    let vcfContent = "";

    chunk.forEach((number, idx) => {
      const globalIndex = chunkIndex * contactsPerFile + idx + 1;

      let contactName = "";
      if (useCustomName) {
        if (nameBase) {
          contactName = `${nameBase} ${fileName || ""}${fileIndex} ${additionalFileName || ""} ${globalIndex}`.trim();
        } else {
          contactName = `${fileName || ""}${fileIndex} ${additionalFileName || ""} ${globalIndex}`.trim();
        }
      } else {
        contactName = nameBase ? `${nameBase} ${globalIndex}` : `kontak ${globalIndex}`;
      }

      vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${number}\nEND:VCARD\n`;
    });

    const blob = new Blob([vcfContent], { type: "text/vcard" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName || fileIndex}${additionalFileName ? " " + additionalFileName : ""}.vcf`;
    link.textContent = `Download ${link.download}`;
    outputDiv.appendChild(link);
  });

  console.log("Split VCF selesai.");
});
