function appendScript(url) {
	const s = document.createElement("script");
	s.type = "text/javascript";
	s.async = true;
	s.src = url;
	const x = document.getElementsByTagName("script")[0];
	x.parentNode.insertBefore(s, x);
}

function loadRiskified() {
	const activateIn = ["us", "ca"];
	const country = window.location.pathname.split("/")[1];
	if (!country || !activateIn.includes(country)) {
		return;
	}

	const hybrisContextUrl = window.location.href
		.split("/")
		.slice(0, 5)
		.join("/");
	fetch(`${hybrisContextUrl}/token`)
		.then((response) => response.json())
		.then(({ fcDomain, fcStoreName, fcToken }) => {
			if (!fcDomain || !fcStoreName || !fcToken) {
				console.warn("Riskified data is missing", {
					fcDomain,
					fcStoreName,
					fcToken,
				});
				return;
			}
			window.fcToken = fcToken;
			appendScript(`${fcDomain}/?shop=${fcStoreName}&sid=${fcToken}`);
		});
}
loadRiskified();
