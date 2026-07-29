# Security Mission Command Builder Design

**Status:** Approved product direction
**Date:** 2026-07-29
**Route:** `/tools/security-command-builder/`
**Product:** Security Mission
**Tagline:** From objective to command, one choice at a time.
**Implementation environment:** OpenCode
**Primary implementation model:** Nemotron 3 Ultra

## 1. Purpose

Security Mission helps students and authorized security testers build correct
command-line invocations without memorizing each tool's flags. The user chooses
an objective, tool, action, platform, target, and options. The application
explains each choice, validates the configuration, and generates a command.

The first release covers the current eCPPT skill domains and a broader training
catalog requested for general laboratory practice. INE publishes exam
objectives rather than a mandatory tool list. Security Mission therefore owns a
versioned objective-to-tool coverage matrix and records the source date for the
certification mapping.

Security Mission generates commands in the browser. It does not execute
commands, connect to targets, upload configurations, or send credentials to a
server.

## 2. Source certification scope

The certification mapping uses the eCPPT objectives published by INE and
reviewed on 2026-07-29:

- Information Gathering and Reconnaissance, 10 percent
- Initial Access, 15 percent
- Web Application Penetration Testing, 15 percent
- Exploitation and Post-Exploitation, 25 percent
- Exploit Development, 5 percent
- Active Directory Penetration Testing, 30 percent

Source:
<https://ine.com/security/certifications/ecppt-certification>

The catalog also includes wireless assessment, packet construction, traffic
analysis, tunneling, and reporting helpers. These additions support laboratory
training but do not claim to represent current eCPPT exam domains.

## 3. Product principles

### 3.1 One builder

Security Mission uses one registry-driven interface. The application must not
create a separate hard-coded page for each tool.

Users can enter the builder through three views:

1. Browse by objective
2. Browse by tool
3. Browse guided workflows

All three views create the same versioned project configuration and open the
same command workspace.

### 3.2 Commands first, workflows when useful

A command recipe builds one invocation. A workflow connects command recipes
when a learning objective requires ordered stages.

The application must not create artificial multi-step workflows for commands
that need only one invocation. Each workflow step stores a complete command
configuration and declares which explicit values can feed later steps. Version
one does not parse pasted tool output or infer targets from live results.

### 3.3 Teach choices

Each configurable option provides:

- a plain-language label;
- the standard flag or technical term;
- a short description;
- a longer explanation;
- suitable and unsuitable use cases;
- prerequisites and privilege requirements;
- platform support;
- compatibility rules;
- a safe default where one exists;
- the resulting command effect.

The interface must explain why a disabled option cannot work with the current
configuration.

### 3.4 Deterministic generation

The same resolved configuration must produce the same command and explanation.
Security Mission does not use an LLM to invent commands.

### 3.5 Authorized use

The user must select an authorization context before generation:

- personal lab;
- certification lab;
- capture-the-flag environment;
- client-authorized assessment.

The selection records context for the project and generated runbook. It does
not serve as proof of authorization.

Security Mission omits unbounded denial-of-service presets, destructive disk
operations, persistence recipes, and automatic data exfiltration. High-rate
credential checks and packet-generation controls require visible rate and
lockout warnings.

### 3.6 Preserve portfolio identity

The tool uses the portfolio's terminal and pixel visual language:

- flat dark panels;
- cyan, green, and gold signals;
- hard borders and square corners;
- monospace command output;
- no gradients, glass effects, or blurred decorative backgrounds;
- no horizontal page overflow.

## 4. Primary users and outcomes

The primary user is preparing for the current eCPPT certification in an
authorized lab. Secondary users include students, CTF participants, and
security practitioners who need a flag reference.

The product succeeds when a user can:

1. find a tool by name or security objective;
2. choose an action without knowing its flags;
3. understand the selected flags and their trade-offs;
4. catch invalid or risky combinations before copying a command;
5. copy a platform-correct command;
6. work through a curated multi-command learning workflow;
7. export a sanitized project or runbook;
8. return later and import the same non-sensitive configuration.

## 5. Information architecture

### 5.1 Route structure

The first release uses one public route:

```text
/tools/security-command-builder/
```

Search engines and the tools index refer to the product as Security Mission.
The route name describes the utility without requiring users to know the
product name.

### 5.2 Entry views

#### Browse by objective

The objective browser groups cards under:

- eCPPT domains;
- Supporting network skills;
- Wireless laboratory skills;
- Traffic analysis;
- Pivoting and tunneling;
- Reporting and evidence.

Each objective card shows the learning outcome, certification mapping, relevant
tools, difficulty, and available workflows.

#### Browse by tool

The tool browser provides:

- searchable tool names and aliases;
- category filters;
- operating-system filters;
- command-line versus GUI-companion filters;
- eCPPT-domain badges;
- an installation and availability note;
- supported actions.

Searching for `nc`, `netcat`, or `ncat` must lead to the related Netcat family
while preserving implementation differences.

#### Browse workflows

Workflow cards show:

- objective;
- included tools;
- step count;
- prerequisites;
- platform;
- expected evidence;
- authorization and risk notes.

### 5.3 Builder sequence

Each project uses the following sequence:

1. **Scope**: select authorization context, platform, and shell.
2. **Objective**: select an eCPPT or supporting learning objective.
3. **Tool**: choose a compatible tool or accept a recommendation.
4. **Action**: select a command recipe or guided workflow.
5. **Target**: configure typed hosts, networks, URLs, ports, files, and names.
6. **Configure**: choose action-specific options.
7. **Review**: resolve warnings, inspect explanations, and confirm placeholders.
8. **Generate**: copy the command or export the sanitized project and runbook.

Workflow projects keep this outer sequence and add an inner workflow-step rail
inside Configure, Review, and Generate.

### 5.4 Learning levels

Security Mission uses one project state across three disclosure levels:

- **Guided** shows the minimum fields for a conservative training command.
- **Customize** adds common flags that change behavior or output.
- **Advanced** adds specialist protocol, performance, evasion, debugging, and
  export controls when the recipe supports them.

Changing the level preserves configured values. Hidden values remain subject to
validation and appear again when the user restores the prior level.

## 6. Workspace layout

### 6.1 Desktop

Desktop uses:

- a product header and active-mission readout;
- a learning-level switch;
- an outer workflow rail;
- a configuration column;
- a command or runbook preview column;
- a sticky action row contained inside its panel.

Both workspace columns use `minmax(0, ...)` so long targets and commands cannot
expand the page.

### 6.2 Mobile and tablet

Mobile and narrow tablet widths use Configure and Command tabs. The application
preserves state when users change tabs. Command output scrolls inside its panel.
The workflow rail scrolls on its own axis.

### 6.3 Command preview

The command preview provides:

- platform and shell labels;
- syntax-highlighted tokens;
- a human-readable command summary;
- active warnings;
- masked sensitive placeholders;
- copy command;
- copy explanation;
- download runbook;
- export configuration.

The preview shows line continuations for readability. The copy action can
produce a single-line or formatted multi-line command.

## 7. Canonical project state

The application stores one versioned project:

```ts
type SecurityMissionProject = {
  schemaVersion: number;
  mode: "command" | "workflow";
  authorizationContext:
    | "personal-lab"
    | "certification-lab"
    | "ctf"
    | "client-authorized";
  learningLevel: "guided" | "customize" | "advanced";
  platform: "linux" | "windows" | "macos";
  shell: "bash" | "powershell" | "cmd";
  objectiveId: string;
  toolId: string | null;
  actionId: string | null;
  workflowId: string | null;
  target: Record<string, unknown>;
  options: Record<string, unknown>;
  output: {
    format: "single-line" | "multi-line";
    includeComments: boolean;
    includeLabValues: boolean;
  };
  workflow: {
    activeStepId: string | null;
    steps: Array<{
      stepId: string;
      toolId: string;
      actionId: string;
      target: Record<string, unknown>;
      options: Record<string, unknown>;
    }>;
  };
};
```

The schema migration layer must preserve valid saved projects. A tool or action
change resets only fields that the new registry records mark as incompatible.

## 8. Registry architecture

### 8.1 Objective registry

Each objective record includes:

```ts
type SecurityObjective = {
  id: string;
  title: string;
  technicalTerm: string;
  description: string;
  domain:
    | "reconnaissance"
    | "initial-access"
    | "web-application"
    | "exploitation-post-exploitation"
    | "exploit-development"
    | "active-directory"
    | "network-foundations"
    | "traffic-analysis"
    | "wireless"
    | "pivoting"
    | "reporting";
  certification: {
    name: "eCPPT" | null;
    sourceDate: string | null;
    objectiveText: string | null;
  };
  difficulty: "foundation" | "intermediate" | "advanced";
  toolIds: string[];
  workflowIds: string[];
};
```

### 8.2 Tool registry

Each tool record includes:

```ts
type SecurityTool = {
  id: string;
  name: string;
  aliases: string[];
  description: string;
  categories: string[];
  platforms: Array<"linux" | "windows" | "macos">;
  shells: Array<"bash" | "powershell" | "cmd">;
  interface: "cli" | "gui-companion";
  executableNames: string[];
  homepage?: string;
  installNotes: PlatformNote[];
  privilege: "user" | "elevated" | "varies";
  objectiveIds: string[];
  actionIds: string[];
};
```

### 8.3 Action registry

An action represents one command recipe:

```ts
type SecurityAction = {
  id: string;
  toolId: string;
  title: string;
  objectiveIds: string[];
  summary: string;
  prerequisites: string[];
  risk: "low" | "elevated" | "high";
  fields: SecurityControl[];
  fixedTokens: CommandToken[];
  argumentRules: ArgumentRule[];
  compatibilityRules: CompatibilityRule[];
  validationRules: ValidationRule[];
  evidenceHints: string[];
  verification: {
    toolVersion: string;
    verifiedAt: string;
    evidenceTier: "local-help" | "official-docs" | "pending";
    sourceUrls: string[];
    helpCommand?: string;
    notes?: string;
  };
};
```

Registry records must remain serializable. UI components must not contain tool
flags or certification mappings. Actions with `evidenceTier: "pending"` may
appear in the implementation ledger but cannot ship in the public catalog.

### 8.4 Control registry

Controls support:

- text;
- number;
- toggle;
- select;
- multi-select;
- port;
- port range;
- host;
- CIDR network;
- URL;
- domain name;
- username;
- file path;
- directory path;
- duration;
- rate;
- placeholder secret;
- output filename.

Each control declares its learning level, visibility, enablement rules,
validation, explanation, and command effect.

### 8.5 Workflow registry

```ts
type SecurityWorkflow = {
  id: string;
  title: string;
  objectiveIds: string[];
  description: string;
  platform: "linux" | "windows" | "cross-platform";
  prerequisites: string[];
  risk: "low" | "elevated" | "high";
  steps: Array<{
    id: string;
    title: string;
    purpose: string;
    toolId: string;
    actionId: string;
    defaults: Record<string, unknown>;
    acceptsBindings: WorkflowBinding[];
    evidenceHints: string[];
  }>;
};
```

Bindings pass explicit values such as `target.host`, `target.ports`, or
`output.filename`. They do not parse command output.

## 9. Resolution and generation pipeline

Each state change passes through:

1. project migration;
2. objective lookup;
3. tool and action lookup;
4. platform and shell compatibility checks;
5. action defaults;
6. workflow binding resolution;
7. field visibility and enablement;
8. field validation;
9. cross-field validation;
10. sensitive-value replacement;
11. command-token construction;
12. shell-specific quoting;
13. explanation and warning assembly;
14. export generation.

Generation stops when the project has an error. Warnings allow generation after
the user reviews them.

## 10. Command compiler

### 10.1 Token-based construction

The compiler builds typed argument tokens. Registry definitions must not
interpolate user values into raw shell strings.

The compiler distinguishes:

- executable tokens;
- fixed flag tokens;
- user-value tokens;
- repeated arguments;
- fixed pipelines;
- fixed redirections;
- environment placeholders;
- line-continuation markers.

Only registry authors can define pipelines, redirections, and shell operators.
The compiler quotes each user value as data.

### 10.2 Shell support

Version one supports:

- Bash and compatible POSIX-style shells;
- PowerShell;
- Windows Command Prompt.

Each action declares supported shells. The UI disables unsupported shell and
platform combinations with a reason.

### 10.3 Quoting

The quoting layer must cover:

- spaces;
- quotes;
- backslashes;
- dollar signs;
- ampersands;
- pipes;
- semicolons;
- parentheses;
- percent expansion;
- PowerShell interpolation;
- leading dashes in user values;
- IPv6 literals;
- URLs with query strings.

Targets and filenames cannot add extra commands.

### 10.4 Secrets

Security Mission asks for placeholder names rather than secret values. Example
placeholders include:

```text
<PASSWORD>
<TOKEN>
<HASH_FILE>
<PRIVATE_KEY_PATH>
```

The application masks placeholder-secret fields and removes secret-shaped
values during import, export, and state migration.

### 10.5 Paths and output

Download filenames and project paths must:

- remain relative;
- reject parent traversal;
- reject control characters;
- use a safe extension for the selected export;
- avoid shell metacharacters unless the compiler quotes them as data.

## 11. Version-one tool catalog

The registry must include the following tool families. A tool receives a full
command builder when its command-line interface fits the product. GUI products
receive launcher options, filter helpers, and learning checklists.

### 11.1 Network foundations

| Tool or family | Required coverage |
|---|---|
| `ip` | Addresses, links, routes, neighbors |
| `ipconfig` | Interface and DNS configuration display |
| `ping` | Count, timeout, address-family selection |
| `fping` | Host-list and network discovery |
| `arp` | Neighbor-table inspection |
| `arp-scan` | Authorized local-network discovery |
| Netdiscover | Passive and active local discovery |
| traceroute and tracert | Route observation |
| `route` | Route-table inspection |
| `ss` | Listening and connected socket inspection |
| netstat | Cross-platform socket and route inspection |

### 11.2 Reconnaissance and service enumeration

| Tool or family | Required coverage |
|---|---|
| Nmap | Host discovery, TCP/UDP scanning, version detection, NSE categories, timing, target input, output |
| Masscan | Rate-limited port discovery and output |
| RustScan | Fast discovery followed by Nmap arguments |
| WHOIS | Registration lookup |
| dig | Record selection, resolver, reverse lookup, trace |
| host | Forward and reverse DNS lookup |
| nslookup | Server and record queries |
| DNSRecon | Standard DNS enumeration modes |
| DNSenum | Domain enumeration and output |
| SNMPwalk | Versions, community placeholder, OID, output |
| OneSixtyOne | Rate-limited SNMP community audit |
| NBtscan | NetBIOS discovery |
| enum4linux-ng | SMB and Windows enumeration modules |
| smbclient | Shares, listings, authentication placeholders |
| rpcclient | RPC queries and authentication placeholders |
| LDAPSearch | Base DN, filter, attributes, TLS, bind placeholders |
| OpenSSL `s_client` | TLS connection and certificate inspection |
| Netcat family | TCP/UDP connection, banner input, listener, timeout, verbose mode |

### 11.3 Initial access and credential auditing

| Tool or family | Required coverage |
|---|---|
| Hydra | Service modules, username and password inputs, tasks, timeout, stop conditions, output |
| Medusa | Host, module, credential inputs, parallelism, output |
| Ncrack | Supported services, credential inputs, timing, output |
| Kerbrute | User enumeration and authorized password-spray preparation |
| NetExec | Protocol, target, authentication placeholders, enumeration modules |
| SSH | User, host, port, identity path, options |
| Evil-WinRM | Host, user, password/hash/key placeholders, SSL |
| FreeRDP | Host, domain, user, credential placeholder, display and certificate options |

Credential-auditing builders must show account-lockout, rate, and scope
warnings before generation.

### 11.4 Web application testing

| Tool or family | Required coverage |
|---|---|
| curl | Methods, headers, body, authentication placeholders, proxy, TLS, redirects, cookies, timing, output |
| wget | Recursive limits, headers, authentication placeholders, output |
| WhatWeb | Aggression level, plugins, targets, output |
| Nikto | Host, port, TLS, tuning, authentication placeholder, output |
| ffuf | URL wordlist placeholder, matchers, filters, rate, recursion, output |
| Gobuster | Directory, DNS, and virtual-host modes |
| Feroxbuster | URL, wordlist, filters, rate, recursion, output |
| Dirsearch | URL, extensions, wordlist, rate, authentication placeholder, output |
| Wfuzz | Payload source, request location, filters, rate, output |
| WPScan | Enumeration modes, API-token placeholder, throttling, output |
| sqlmap | Request source, technique selection, risk and level, session and output options |
| Burp Suite companion | Proxy setup, scope checklist, Repeater workflow, export reminders |
| OWASP ZAP companion | Local proxy setup, context and passive-scan checklist |

The Guided level for sqlmap must prefer identification and confirmation options.
Advanced actions may expose supported lab techniques with explicit scope
warnings.

### 11.5 Exploitation and post-exploitation

| Tool or family | Required coverage |
|---|---|
| SearchSploit | Search terms, exact matching, path display, local copy |
| Metasploit console | Launch options, module search checklist, workspace and database notes |
| msfvenom | Payload selection, format, encoder controls, bad-character input, output path |
| Netcat, nc, and ncat | Listener/client modes, TLS where supported, UDP, timeout, logging |
| Socat | Typed endpoint pairs for common laboratory relays and listeners |
| Python HTTP server | Bind address, port, directory |
| Impacket SMB server | Share name, path, protocol and authentication options |
| certutil and PowerShell transfer helpers | Controlled lab download with placeholder URLs and paths |
| LinPEAS | Invocation options and evidence-capture notes |
| WinPEAS | Invocation options and evidence-capture notes |
| pspy | Process monitoring interval and output |
| Native Linux enumeration | Identity, sudo rules, permissions, capabilities, processes, services, cron, sockets |
| Native Windows enumeration | Identity, privileges, system information, services, tasks, network state |
| HashID | Hash-type identification |
| Hashcat | Hash mode, attack mode, wordlist, masks, rules, devices, sessions, restore, show |
| John the Ripper | Format, wordlist, rules, session, restore, show |
| secretsdump | Authorized local and remote credential-dump configurations with placeholders |

### 11.6 Pivoting and tunneling

| Tool or family | Required coverage |
|---|---|
| SSH | Local, remote, and dynamic port forwarding |
| ProxyChains | Proxy configuration checklist and wrapped command preview |
| sshuttle | Network routes, remote host, DNS, exclusions |
| Chisel | Server/client roles, reverse mode, typed tunnel mappings |
| Ligolo-ng | Proxy and agent setup checklist, interface and route commands |
| Socat | Forwarding and relay endpoint pairs |

Workflow exports must separate commands by host role so users do not run a
server command on the client machine.

### 11.7 Exploit development

| Tool or family | Required coverage |
|---|---|
| file | Binary type inspection |
| strings | Encoding, minimum length, offsets |
| objdump | Headers, sections, symbols, disassembly |
| readelf | ELF headers, sections, symbols, program headers |
| checksec | File and process protection inspection |
| GDB | File, arguments, command file, core file |
| Pwndbg companion | Setup and common inspection checklist |
| Metasploit pattern tools | Pattern creation and offset lookup |
| GCC | Architecture, debug, warnings, protection flags, output |
| NASM | Format, listing, output |
| Python | Script, module, unbuffered and isolated modes |
| Pwntools companion | Project setup, architecture and connection placeholders |

### 11.8 Active Directory

| Tool or family | Required coverage |
|---|---|
| NetExec | SMB, WinRM, LDAP, RDP, MSSQL, authentication placeholders, enumeration modules |
| smbclient and rpcclient | Domain share and RPC enumeration |
| LDAPSearch | Domain queries and filters |
| Kerbrute | User enumeration and controlled password spraying |
| Responder | Interface, protocol selection, analyze mode, output notes |
| Impacket GetNPUsers | AS-REP roastable account discovery and output |
| Impacket GetUserSPNs | Service-account enumeration and ticket requests |
| Impacket secretsdump | SAM, LSA, NTDS, local and authorized remote modes |
| Impacket psexec | Authorized remote execution configuration |
| Impacket wmiexec | Authorized WMI execution configuration |
| Impacket smbexec | Authorized service execution configuration |
| Impacket atexec | Authorized scheduled-task execution configuration |
| Impacket ntlmrelayx | Lab relay configuration with target and protocol controls |
| Impacket getTGT and getST | Kerberos ticket request configuration |
| Impacket ticketer | Laboratory ticket construction with explicit domain identifiers |
| BloodHound Python collector | Domain, nameserver, collection methods, output |
| SharpHound companion | Collection-method and output checklist |
| ldapdomaindump | Domain, bind placeholders, output |
| Evil-WinRM | Password, hash, certificate and SSL connection modes |
| Mimikatz companion | Laboratory privilege, credential, and ticket command references |
| Rubeus companion | Kerberos enumeration and ticket workflow references |
| PowerView companion | Domain enumeration command references |
| Certipy | Discovery, authentication placeholders, request and output modes |

Active Directory recipes must map to the published objectives for enumeration,
weak-password checks, AS-REP roasting, pass-the-hash, pass-the-ticket, lateral
movement, and privilege verification.

### 11.9 Traffic, packet, and wireless tools

| Tool or family | Required coverage |
|---|---|
| hping3 | TCP, UDP, and ICMP packet construction, count, interval, flags, payload size |
| tcpdump | Interface, host, network, port, protocol, capture and read files |
| tshark | Capture and display filters, fields, statistics, input and output |
| Wireshark companion | Capture-filter and display-filter builder |
| iw | Wireless interfaces, links, and device information |
| rfkill | Wireless block-state inspection and controlled unblock |
| airmon-ng | Interface checks, monitor-mode start and stop |
| airodump-ng | Authorized network observation, channel, BSSID, output |
| aireplay-ng | Authorized laboratory replay and client-test actions with rate warnings |
| aircrack-ng | Capture verification, wordlist placeholder, BSSID, output |

The hping3 builder excludes flood mode and unbounded packet counts. Wireless
builders display authorization and local radio-interference warnings.

## 12. Curated workflows

Version one includes the following workflow groups.

### 12.1 Reconnaissance

- Local network orientation
- Host discovery
- Full TCP port discovery
- Targeted service and default-script enumeration
- UDP service discovery
- DNS enumeration
- SMB and RPC enumeration
- SNMP enumeration
- TLS certificate inspection

### 12.2 Initial access and credential auditing

- Username discovery and validation
- Lockout-aware password spray preparation
- Remote-service credential audit
- Credential verification through the selected protocol

### 12.3 Web application testing

- Web surface identification
- Content and virtual-host discovery
- Request reproduction with curl
- Login-form audit preparation
- SQL injection identification and confirmation
- Outdated component identification
- Evidence capture for a finding

### 12.4 Exploitation and post-exploitation

- Search, inspect, and copy a public exploit
- Prepare a laboratory payload and listener
- Establish and document a Netcat connection
- Transfer a file in an authorized lab
- Linux local enumeration
- Windows local enumeration
- Hash identification and offline audit
- Evidence collection and cleanup reminders

### 12.5 Pivoting

- SSH local forwarding
- SSH dynamic forwarding with ProxyChains
- Reverse tunnel setup
- Route a lab subnet with sshuttle
- Chisel two-host setup
- Ligolo-ng multi-host setup

### 12.6 Exploit development

- Inspect a binary and its protections
- Generate a cyclic pattern and find the offset
- Compile a debug build
- Inspect a crash in GDB
- Start a Pwntools exploit skeleton

### 12.7 Active Directory

- Discover domain context
- Enumerate LDAP, SMB, users, groups, and shares
- Validate usernames with Kerberos
- Identify AS-REP roastable accounts
- Enumerate service accounts and request test tickets
- Collect a BloodHound data set
- Test authorized pass-the-hash access
- Prepare a pass-the-ticket laboratory session
- Compare supported remote-management methods
- Record domain privilege evidence

### 12.8 Wireless and packet testing

- Prepare a wireless interface for monitor mode
- Observe an authorized wireless network
- Capture and verify an authorized handshake
- Perform an offline wireless password audit
- Build a bounded hping3 packet test
- Capture and filter traffic with tcpdump or tshark

## 13. Recommendations

Recommendations use deterministic rules:

- suggest Nmap for general service discovery;
- suggest curl for reproducing a known HTTP request;
- suggest ffuf or Gobuster based on the selected discovery action;
- suggest Netcat for a basic TCP or UDP connectivity check;
- suggest Ncat when TLS support is required;
- suggest Hashcat or John based on the selected hash source and attack style;
- suggest NetExec for multi-protocol Active Directory checks;
- suggest Impacket tools for protocol-specific Kerberos and remote-service tasks;
- suggest tcpdump for fast capture and tshark for structured CLI analysis;
- suggest GUI companions when the task depends on interactive inspection.

Recommendations explain their reason and do not overwrite an explicit valid
selection.

## 14. Validation and compatibility

### 14.1 Typed targets

Security Mission validates:

- IPv4 and IPv6 hosts;
- CIDR networks;
- hostnames and domain names;
- URLs and schemes;
- single ports and bounded ranges;
- file and directory paths;
- Windows domain names, SIDs, and SPNs where required;
- wireless BSSIDs and channels.

### 14.2 Cross-field rules

Examples include:

- UDP-only flags require a UDP-capable action;
- TLS options require a compatible tool and endpoint;
- a URL wordlist action requires a supported placeholder in the URL;
- password-spray actions require a rate or task limit;
- output formats must match their filenames;
- a workflow binding must match the destination field type;
- Windows-only tools cannot generate Bash commands;
- Linux wireless actions require a compatible Linux platform;
- a listener port cannot exceed the valid port range;
- Nmap host discovery options cannot conflict with a selected no-discovery mode.

### 14.3 Errors and warnings

Errors block generation. Warnings remain visible in the preview and export.

Errors cover:

- missing required values;
- malformed targets;
- incompatible platform or shell;
- unsupported action and tool combinations;
- unsafe paths;
- invalid imported configuration;
- unknown registry identifiers;
- failed workflow bindings.

Warnings cover:

- elevated privileges;
- service lockout risk;
- high packet or request rates;
- intrusive scan categories;
- certificate-verification changes;
- placeholders that the user must replace;
- commands assigned to a different workflow host role.

## 15. Privacy and safety boundaries

### 15.1 Local state

The application keeps the active project in React state. Version one does not
send analytics events containing targets, usernames, domains, paths, hashes, or
generated commands.

### 15.2 Import and export

The default export replaces:

- credentials;
- API tokens;
- private-key contents;
- password hashes entered as text;
- cookies and authorization headers;
- client names and target values when the user has not enabled lab-value export.

Exports may retain local file placeholders and non-sensitive option choices.

### 15.3 Unsupported behavior

The first release does not provide:

- remote command execution;
- a web shell;
- automatic target scanning;
- live command-output parsing;
- unbounded packet flooding;
- persistence deployment;
- destructive cleanup;
- automatic data exfiltration;
- stealth claims or antivirus-bypass promises;
- default credentials or real credential lists.

## 16. Export formats

Security Mission provides:

- copy single-line command;
- copy formatted command;
- download a sanitized JSON project;
- import a JSON project;
- download a Markdown workflow runbook;
- download a plain-text command list;
- download a low-risk shell script when every included workflow step supports
  the selected shell.

Generated scripts include:

- authorization-context comment;
- prerequisite comments;
- placeholder summary;
- `set -e` or the shell-appropriate failure behavior when safe;
- pauses between workflow host roles;
- evidence filenames;
- no embedded secrets.

## 17. Accessibility and responsive behavior

All controls, explanations, tabs, warnings, and actions must work with a
keyboard and expose meaningful accessible names.

Required behavior:

- the current step uses `aria-current`;
- learning levels use pressed-state semantics;
- validation errors connect to fields through descriptions;
- disabled controls include a visible reason;
- tool search announces the result count;
- command status changes use a polite live region;
- code blocks retain readable contrast;
- focus does not move when command generation updates;
- mobile tabs preserve project state.

Required viewport checks:

- 320 by 700;
- 360 by 800;
- 390 by 844;
- 768 by 1024;
- 900 by 900;
- 1024 by 768;
- 1440 by 900.

## 18. Proposed repository structure

The implementation follows the current Model Mission split between pure
JavaScript domain logic and TypeScript React components. Node's built-in test
runner can import the pure JavaScript modules without a new test runtime.

```text
app/
└── tools/
    └── security-command-builder/
        ├── layout.tsx
        ├── page.tsx
        └── template.tsx

components/
└── tools/
    └── security-mission/
        ├── SecurityMission.module.css
        ├── SecurityMissionShell.tsx
        ├── SecurityMissionNavigator.tsx
        ├── SecurityMissionRail.tsx
        ├── SecurityMissionStepPanel.tsx
        ├── SecurityControlRenderer.tsx
        ├── SecurityField.tsx
        ├── SecurityExplanation.tsx
        ├── SecurityRecommendation.tsx
        ├── SecurityWarningPanel.tsx
        ├── CommandPreviewPanel.tsx
        ├── WorkflowPreviewPanel.tsx
        ├── ToolBrowser.tsx
        ├── ObjectiveBrowser.tsx
        └── WorkflowBrowser.tsx

lib/
├── hooks/
│   └── useSecurityMission.ts
└── tools/
    └── security-mission/
        ├── catalog.js
        ├── compiler.js
        ├── control-registry.js
        ├── exports.js
        ├── objective-registry.js
        ├── project-config.js
        ├── project-config-migrations.js
        ├── quoting.js
        ├── recommendations.js
        ├── sensitive-values.js
        ├── source-ledger.js
        ├── state.js
        ├── validation.js
        ├── workflow-registry.js
        ├── tools/
        │   ├── active-directory/
        │   ├── credential-auditing/
        │   ├── exploit-development/
        │   ├── exploitation/
        │   ├── network/
        │   ├── pivoting/
        │   ├── traffic/
        │   ├── web/
        │   └── wireless/
        └── workflows/
            ├── active-directory.js
            ├── credential-auditing.js
            ├── exploit-development.js
            ├── exploitation.js
            ├── network.js
            ├── pivoting.js
            ├── traffic.js
            ├── web.js
            └── wireless.js

tests/
└── tools/
    ├── security-mission-catalog.test.js
    ├── security-mission-command-snapshots.test.js
    ├── security-mission-compiler.test.js
    ├── security-mission-coverage.test.js
    ├── security-mission-exports.test.js
    ├── security-mission-live-route.test.js
    ├── security-mission-project-config.test.js
    ├── security-mission-quoting.test.js
    ├── security-mission-responsive.test.js
    ├── security-mission-source-ledger.test.js
    ├── security-mission-state.test.js
    ├── security-mission-style.test.js
    ├── security-mission-validation.test.js
    └── security-mission-workflows.test.js

scripts/
└── build_security_mission_audit_artifacts.py

docs/
├── reports/
│   ├── 2026-07-29-security-mission-audit.md
│   ├── 2026-07-29-security-mission-evidence.json
│   ├── 2026-07-29-security-mission-implementation-progress.md
│   └── 2026-07-29-security-mission-tool-verification.json
└── superpowers/
    └── plans/
        └── 2026-07-29-security-mission-command-builder.md
```

The implementation updates:

- `data/tools.js` to add the Security Mission card;
- `package.json` to add focused Security Mission test scripts;
- `app/tools/page.tsx` metadata and copy if needed to represent security tools;
- `app/sitemap.js` if the sitemap does not derive the new route.

### 18.1 Nemotron 3 Ultra and OpenCode execution profile

Nemotron 3 Ultra serves as the primary implementation agent inside OpenCode.
The model may use its cybersecurity training to propose tool actions, flag
relationships, aliases, workflow stages, and explanations. Training data does
not count as verification evidence.

#### Workspace and branch

OpenCode must start from:

```text
D:\work\portflioWebsite\myPortfolio
```

The implementation should use:

```text
feature/security-mission-command-builder
```

The agent must start from the completed portfolio and Model Mission state. It
must not implement Security Mission on an active Model Mission branch or mix
unrelated migration files into Security Mission commits. If the checkout
contains unrelated changes, the agent must create or use an isolated worktree
instead of cleaning, resetting, moving, or deleting those changes.

#### Required context-loading order

At the beginning of the first OpenCode session, Nemotron must read:

1. `D:\work\portflioWebsite\myPortfolio\AGENTS.md`
2. `D:\work\portflioWebsite\myPortfolio\docs\superpowers\specs\2026-07-29-security-mission-command-builder-design.md`
3. `D:\work\portflioWebsite\myPortfolio\docs\superpowers\plans\2026-07-29-security-mission-command-builder.md`
4. `D:\work\portflioWebsite\myPortfolio\package.json`
5. `D:\work\portflioWebsite\myPortfolio\data\tools.js`
6. `D:\work\portflioWebsite\myPortfolio\lib\tools\ml-generator\model-mission\control-registry.js`
7. `D:\work\portflioWebsite\myPortfolio\lib\tools\ml-generator\model-mission\state.js`
8. `D:\work\portflioWebsite\myPortfolio\components\tools\model-mission\ModelMissionShell.tsx`
9. `D:\work\portflioWebsite\myPortfolio\tests\tools\model-mission-control-registry.test.js`
10. `D:\work\portflioWebsite\myPortfolio\tests\tools\model-mission-responsive.test.js`

The agent should load only the tool modules and tests needed for the active
implementation task after this first orientation. This keeps each task within
a reviewable context.

#### Source authority

Nemotron must use this authority order for command facts:

1. output from the installed tool's version and `--help`, `-h`, help subcommand,
   or local manual page;
2. official upstream documentation or the tool's official source repository;
3. the current INE eCPPT objectives for certification mapping;
4. Nemotron's trained knowledge for discovery and candidate generation.

The model must record the chosen source, tool version, review date, and evidence
tier in
`docs/reports/2026-07-29-security-mission-tool-verification.json`.
Conflicting or missing evidence blocks that action from the public catalog.

Nemotron must not:

- invent a flag when documentation is unavailable;
- combine syntax from different versions without a version rule;
- treat a blog, cheat sheet, copied command list, or generated answer as an
  authoritative source;
- claim that a tool belongs to eCPPT because the model remembers seeing it in a
  course;
- add a real target, credential, token, hash, client name, or private key to
  tests, fixtures, snapshots, reports, or commits.

#### Per-tool implementation cycle

For each tool family, Nemotron must:

1. list candidate actions from its trained knowledge;
2. verify the executable name, supported platforms, actions, flags, defaults,
   incompatibilities, and output behavior;
3. write failing registry, validation, quoting, and snapshot tests;
4. implement the smallest registry and compiler changes that pass those tests;
5. run the focused tests and the shared Security Mission contract tests;
6. record verification evidence and unsupported actions;
7. inspect the diff for secrets, real targets, unsafe shell interpolation, and
   unrelated files;
8. commit the bounded task.

The agent must mark uncertain actions as deferred in the verification ledger.
It must not weaken a test to preserve an unverified command.

#### Task and context boundaries

Nemotron should work through the implementation plan in order. One coding task
may cover one infrastructure boundary or one cohesive tool family. The agent
must not implement the entire catalog in one turn.

After each committed task, the agent updates:

```text
D:\work\portflioWebsite\myPortfolio\docs\reports\2026-07-29-security-mission-implementation-progress.md
```

The progress record includes:

- task and commit;
- files changed;
- tool versions and evidence tiers;
- tests run and results;
- deferred actions;
- known risks;
- the next task and its required context.

#### Review gates

Nemotron performs a self-review after each task. OpenCode then starts a clean
review session with the task brief, commit diff, test output, and verification
records. The reviewer does not receive the implementer's private reasoning. The
review checks:

- compliance with this specification and the implementation plan;
- command and flag accuracy against recorded sources;
- shell injection and secret-handling boundaries;
- UI reachability for each registered control;
- regression-test quality;
- scope isolation.

The implementation agent fixes accepted findings through new failing tests.
Reviewers must reject unverified commands even when the syntax appears
plausible.

## 19. Testing strategy

### 19.1 Registry tests

- tool, alias, objective, action, control, and workflow IDs are unique;
- each referenced ID exists;
- each tool exposes at least one action or GUI companion;
- each current eCPPT objective maps to a primary tool and an alternate where one
  exists;
- Guided controls form a subset of Customize and Advanced;
- explanations contain the required fields;
- platform and shell declarations are valid.

### 19.2 Compiler and quoting tests

- representative commands match reviewed snapshots;
- user values remain single arguments;
- shell metacharacters cannot add commands;
- IPv6, URLs, UNC paths, spaces, and quotes compile correctly;
- fixed pipelines remain registry-owned;
- unsupported shell combinations fail before compilation;
- single-line and multi-line output remain equivalent.

### 19.3 Validation tests

- malformed hosts, networks, URLs, ports, BSSIDs, SIDs, and paths fail;
- cross-field conflicts produce a specific message;
- credential-audit actions require bounded concurrency or rate;
- hping3 actions reject flood and unbounded counts;
- wireless actions require Linux and show privilege warnings;
- secret-shaped imports become placeholders;
- output paths reject traversal.

### 19.4 Workflow tests

- each step references a valid tool and action;
- bindings connect compatible field types;
- host roles remain visible;
- the workflow runbook follows registry order;
- changing a shared target updates compatible steps;
- changing a tool resets only incompatible options;
- no workflow requires output parsing.

### 19.5 State and export tests

- project migrations preserve valid choices;
- learning-level changes preserve hidden values;
- tool and action changes clear incompatible values;
- JSON export round-trips;
- default exports remove sensitive values;
- runbooks include prerequisites, warnings, commands, and evidence hints;
- copied and downloaded commands use the current state.

### 19.6 Route and browser tests

- the tools index links to Security Mission;
- the public route renders the builder;
- tool, objective, and workflow search work;
- mobile tabs preserve state;
- command copy status is announced;
- validation receives focus only after explicit submission;
- the page has no horizontal overflow at required widths;
- panels do not overlap;
- computed backgrounds contain no gradients.

### 19.7 Completion gate

The implementation is complete when:

- TypeScript passes;
- the Next production build passes;
- all existing tests remain green;
- all Security Mission tests pass;
- the coverage test accounts for each current eCPPT objective;
- representative commands for each tool family pass snapshot review;
- sensitive-value and injection tests pass;
- responsive tests pass at each required viewport;
- the audit report records coverage, limitations, and remaining gaps.

### 19.8 Model-knowledge verification

- each public action has `local-help` or `official-docs` evidence;
- each action records a tool version or a version range;
- source URLs point to official upstream material;
- installed-tool evidence records the help command and captured version;
- version-specific flags compile only for compatible versions;
- the verification ledger contains no real targets or secrets;
- no `pending` action enters the public catalog;
- a reviewer can trace each command snapshot to one verification record.

## 20. Delivery order

The implementation plan should divide work into reviewable tasks:

1. lock the eCPPT coverage matrix and registry contracts;
2. implement canonical state and migrations;
3. implement validation, sensitive-value handling, and shell quoting;
4. implement the deterministic compiler and exports;
5. add network and reconnaissance tools;
6. add web and credential-auditing tools;
7. add exploitation, post-exploitation, and Netcat tools;
8. add pivoting and exploit-development tools;
9. add Active Directory tools;
10. add traffic, hping3, and wireless tools;
11. implement objective, tool, and workflow registries;
12. build the shared React interface;
13. connect the public route and tools index;
14. add responsive, accessibility, and security regression tests;
15. run the end-user audit and document any deferred tool actions.

Each task must start with failing behavior-focused tests, change a bounded set of
files, run focused tests, and commit its own result.

The implementation plan must address Nemotron 3 Ultra directly. Each task
provides:

- its goal and exact repository paths;
- the spec sections to reread;
- official documentation or local-help evidence to collect;
- the failing tests to create;
- the production changes to make;
- focused and regression commands;
- the progress-ledger entry;
- the expected commit message;
- a stop condition for ambiguity, missing sources, or conflicting tool
  versions.

## 21. Explicit non-goals

- executing commands from the browser or portfolio server;
- replacing INE training or claiming official INE affiliation;
- guaranteeing exam content or success;
- ingesting proprietary course content;
- storing targets or credentials in a backend;
- building a terminal emulator;
- parsing live command output in version one;
- supporting arbitrary user-authored shell templates;
- exposing unbounded denial-of-service actions;
- documenting every historical flag for each tool;
- copying external command cheat sheets without verifying their licenses.

## 22. Expected outcome

Security Mission gives an eCPPT student one place to find a tool, understand its
options, and build a command for an authorized lab. The registry and coverage
tests let future contributors add tools without changing the generic interface.
Curated workflows teach how related commands fit together while keeping each
generated step visible and editable.
