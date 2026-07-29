export const SECURITY_OBJECTIVE_IDS = Object.freeze([
  "host-discovery-port-scanning",
  "service-enumeration",
  "username-enumeration",
  "password-spraying",
  "remote-service-brute-force",
  "web-enumeration",
  "web-vulnerability-validation",
  "web-login-audit",
  "outdated-web-components",
  "web-evidence-and-credentials",
  "service-exploitation",
  "privilege-escalation",
  "hash-auditing",
  "local-credential-discovery",
  "exploit-code-adaptation",
  "memory-corruption",
  "ad-enumeration",
  "ad-weak-password-audit",
  "asrep-roasting",
  "ad-pass-the-hash",
  "ad-pass-the-ticket",
  "domain-admin-validation",
  "network-foundations",
  "traffic-analysis",
  "wireless-assessment",
  "pivoting-and-tunneling",
  "reporting-and-evidence",
]);

const DOMAIN_MAP = {
  "host-discovery-port-scanning": "reconnaissance",
  "service-enumeration": "reconnaissance",
  "username-enumeration": "reconnaissance",
  "password-spraying": "initial-access",
  "remote-service-brute-force": "initial-access",
  "web-enumeration": "web-application",
  "web-vulnerability-validation": "web-application",
  "web-login-audit": "web-application",
  "outdated-web-components": "web-application",
  "web-evidence-and-credentials": "web-application",
  "service-exploitation": "exploitation-post-exploitation",
  "privilege-escalation": "exploitation-post-exploitation",
  "hash-auditing": "exploitation-post-exploitation",
  "local-credential-discovery": "exploitation-post-exploitation",
  "exploit-code-adaptation": "exploit-development",
  "memory-corruption": "exploit-development",
  "ad-enumeration": "active-directory",
  "ad-weak-password-audit": "active-directory",
  "asrep-roasting": "active-directory",
  "ad-pass-the-hash": "active-directory",
  "ad-pass-the-ticket": "active-directory",
  "domain-admin-validation": "active-directory",
  "network-foundations": "network-foundations",
  "traffic-analysis": "traffic-analysis",
  "wireless-assessment": "wireless",
  "pivoting-and-tunneling": "pivoting",
  "reporting-and-evidence": "reporting",
};

export const SECURITY_OBJECTIVES = Object.freeze(
  SECURITY_OBJECTIVE_IDS.map((id, index) => {
    const isEcppt = index < 22;
    const title = id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    return {
      id,
      title,
      technicalTerm: title,
      description: `Security mission objective: ${title}`,
      domain: DOMAIN_MAP[id] ?? "reconnaissance",
      difficulty: index < 10 ? "beginner" : index < 20 ? "intermediate" : "advanced",
      certification: {
        name: isEcppt ? "eCPPT" : null,
        sourceUrl: isEcppt ? "https://ine.com/security/certifications/ecppt-certification" : null,
      },
      reviewedAt: "2026-07-29",
    };
  })
);
