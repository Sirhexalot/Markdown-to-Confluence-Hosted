# 2026-07-06 Team Jour Fixe

**Termin:** 29.06.2026\
**Teilnehmende:**

Obermeier, Andreas

\

Tensing, Felix

Schmolzi, Adrian\
\

### Zur Info

Hirsch-Dick, Markus

Lauterbach, Andrè

Bauer, Michael

Reuther, Jan

Pfadenhauer, Stephan

\
\

Agenda

|                                            |
|--------------------------------------------|
| TOP                                        |
| Intro TPL                                  |
| Pflege "Abwesenheitskalender"              |
| Abbildung technische Verantwortung (Excel) |
| Aktueller Stand Software                   |

## Allgemeines

### Pflege Abwesenheitskalender

- Die Abwesenheiten müssen im Abwesenheitskalender gepflegt werden.

**Nächster Schritt**:

- Abwesenheiten laufend im Abwesenheitskalender pflegen. Verantwortlich
  ist aktuell noch offen.

### Übersichtsgrafik DORA-Informationsverbund

Obermeier, Andreas erstellt eine Übersichtsgrafik für den
DORA-Informationsverbund.\
\
\

## Besprochene Punkte und Ergebnisse

### DORA-185 - Abbildung OCP mit Verknüpfungen

#### DORA-187 - Liste aller OCP Namespaces laden und abbilden

- Im Termin wurde festgehalten, dass der OCP-Ordner Nodes und Namespaces
  fehlt auf Produktion.
- Dieser Ordner muss zuerst angelegt werden.
- Erst danach kann der Export wie vorgesehen funktionieren.\
  Status: In Arbeit

|  |  |  |
|----|----|----|
| Topic | Bis wann | Wer ist verantwortlich |
| OCP-Ordner als Voraussetzung für den Export anlegen |  | Reuther, Jan |

### DORA-48 - UC 4 - Verantwortlicher für IT-Ressource (Server)

#### DORA-108 - UC 4 - Quelldatei für "Server-Liste" um "Verantwortlicher" ergänzen

- Die vorgestellte Excel-Vorlage dient als Grundlage für die technische
  Abbildung in der Quelldatei.
- Obermeier, Andreas hat dazu eine Excel-Vorlage vorgestellt, mit der
  die Zuordnung auf Basis einer Regular Expression erfolgen soll.
- Ansprechpartner beziehungsweise Verantwortliche sollen als
  E-Mail-Adresse in der Spalte Verantwortlichkeit gepflegt werden.
- Technische Anbindung ist erfolgt.

**Nächster Schritt**:\
\

|  |  |  |
|----|----|----|
| Topic | Bis wann | Wer ist verantwortlich |
| Excel-Datei ist Quelle die eingebunden werden muss |  | Reuther, Jan |
| Deploy auf vor-prod |  | Reuther, Jan |
| Fachlicher Test |  | Obermeier, Andreas |

### DORA-169 - Datenbanken und DBMS mit Verknüpfungen

#### DORA-170 - Liste aller Datenbanken abbilden und auswerten

- Pfadenhauer, Stephan spricht das DB Verantwortlichen nochmals wegen
  des Aufbaus einer Datenbankliste an.

### DORA-175 - Software (SW, Frameworks & Libraries, SaaS/PaaS/IaaS) und Verknüpfungen

#### DORA-176 - Analyse (Kauf-)Software

- Es wurde festgelegt, dass **Matrix** die maßgebliche Quelle für die
  Erhebung der Software-Inventur sein soll.
- Offene Fragestellung: Informationen zu **JBoss** beziehungsweise
  **Tomcat** müssen noch eingeholt werden
- Stephan Pfadenhauer merkte an, ob diese Informationen künftig in
  **Matrix** zur Verfügung gestellt werden können.

**Nächster Schritt**:

- Das weitere Vorgehen hierzu ist noch offen.

#### DORA-177 - Analyse Frameworks & Libraries

- Für die Analyse der Bibliotheken wurde als Deadline **Ende September
  2026** festgelegt.
- Verantwortlich für dieses Thema ist **Tensing, Felix** .

**Nächster Schritt**:\
\

|  |  |  |
|----|----|----|
| Topic | Bis wann | Wer ist verantwortlich |
| Analyse der Bibliotheken bis Ende September 2026 abschließen. |  | Tensing, Felix |

### DORA-185 Abbildung OCP mit Verknüpfungen

#### DORA-191 Anpassung Config-Checker an OCP-Namespaces / Datenbanken

- Liste der Namespaces fehlt noch

### DORA-192 Applikation mit IT Ressourcen

#### DORA-193 Anpassung Config-Checker an OCP-Namespaces / Datenbanken\
\

|                                    |          |                        |
|------------------------------------|----------|------------------------|
| Topic                              | Bis wann | Wer ist verantwortlich |
| User Story muss beschrieben werden |          | Tensing, Felix         |

#### DORA-194 Fachlicher Test\
\

|                                    |          |                        |
|------------------------------------|----------|------------------------|
| Topic                              | Bis wann | Wer ist verantwortlich |
| User Story muss beschrieben werden |          | Tensing, Felix         |
