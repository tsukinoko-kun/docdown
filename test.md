# Was ist pizzarando?

Pizzarando wurde im November 2021 von Frank Mayer, Nils Feierabend und Berivan Akbulut im Rahmen einer Projektarbeit als Online-Bestelldienst entwickelt. Der Name setzt sich aus den Begriffen Pizza und “rando” (englisch random) zusammen. Pizzarando ermöglicht seinen Kunden Zufalls-generierte Pizzen nach Kategorien zu bestellen. Eine "random" Pizza bedeutet, dass die Größe der Pizza frei wählbar ist, jedoch nicht der Belag. Dieser wird dem Kunden erst bekannt, wenn er seine Pizza erhält. Wer also gerne Pizza isst und sich überraschen lässt, ist bei Pizzarando gut aufgehoben.

Es heißt, "über Geschmack lässt sich nicht streiten", weswegen jeder Kunde seine Lieblingszutaten einer Liste hinzufügen, oder entfernen kann, damit diese bei der Zufallsgenerierung berücksichtigt werden. Für einfache Tage, gibt es auch einfache Pizzen. So kann ein Kunde anstelle einer random Pizza, zum Beispiel eine normale Pizza wählen und kennt somit seinen Pizzabelag.

## Use-Case Diagramm

Ein Use – Case – Diagramm stellt das Verhalten eines Systems aus der Anwendersicht dar. Dem Anwender wird gezeigt, welche Funktionen und Dienste ein System für ihn bereitstellt. Unser Use – Case – Diagramm zeigt vier Funktionen mit entsprechend sekundären Anwendungsfällen, die der Bestellservice bieten soll. Demnach können Kunden, die hier als Akteure fungieren, sich registrieren und anmelden. Eine Pizza aus einer Pizzakategorie wählen und dem Einkaufswagen hinzufügen und die Pizza letztendlich bestellen.

## Technischer Hintergrund

Um die zufälligen Pizzen zu generieren haben wir in den Datenbankstrukturen einzelne Pizzakategorien welche entweder “zufällige” Kategorien sein können, wie zum Beispiel Vegetarische, Meeresfrüchte oder Normale, oder “normale” Pizzen wie etwa Diavolo oder Vier-Käse.
Außerdem gibt es eine Tabelle mit Zutaten und diese können dann in einer weiteren einer Pizzakategorie zugeordnet werden. Wenn nun eine Kategorie gewählt und in den Einkaufswagen gelegt wird, wird geschaut ob es sich um eine zufällige oder normale Kategorie handelt.
Bei der Normalen werden einfach alle zugeordneten Zutaten verwendet die hinterlegt sind.
Bei der Zufälligen jedoch nur eine bestimmte Anzahl N der Zutaten welche dementsprechend zufällig aus der Zuordnungstabelle gewählt werden. Hierbei werden auch Einstellungen des Kunden berücksichtigt welche Zutaten er gerne meiden würde, sei es wegen Allergien oder anderen Gründen. Dies kann er in seinem Profil angeben und die Zutaten finden sich dann nicht in der möglichen Zufallsauswahl.

# Autofill

Formulare auszufüllen dauert lange, zum Glück können aktuelle Browser Abhilfe schaffen. Autofill, zu Deutsch automatisches Ausfüllen, ist eine Funktionalität, bei welcher der Browser ein HTML-Formular basierend auf gespeicherten Informationen, zum Beispiel in der Vergangenheit ausgefüllte Formulare, autonom ausfüllt. Dabei werden die automatisch ausgefüllten Felder eingefärbt, sodass der Nutzer diese als solche identifizieren und gegebenenfalls nachprüfen kann.[1,3]
Damit Autofill weiß, welche Information in welches Feld soll, müssen die Input-Tags über ein autocomplete-Attribut mit entsprechendem Wert verfügen.
Der Wert für die Straße und Hausnummer ist zum Beispiel “street-address”. Zudem kann auch zwischen verschiedenen Arten von Adressen unterschieden werden, zum Beispiel “shipping” und “home”. Ein Input-Tag kann dann so aussehen:
<input name="ship-address" required id="frmAddressS" placeholder="123 Any Street" autocomplete="shipping street-address" />[1]
Die Autofill-Optionen werden auch von Password Managern verwendet, damit diese wissen, wo Benutzername oder E-Mail eingefügt werden muss und ob ein neues Passwort generiert oder ein bekanntes gesucht und eingefügt werden soll.[2]
Auch Entwicklungsumgebungen wie Visual Studio (mit IntelliCode) oder Eclipse (mit Content assist) verwenden eine art Autofill, was dem Entwickler mögliche Variablen, Klassen oder Funktionen vorschlägt.[4]
Auf pizzarando verwenden wir Autofill zum Beispiel auf der Login-, Registrierungs- und Bestellseite.

# Arbeitsablauf

Ein Workflow-Diagramm (Arbeitsablaufdiagramm) stellt visuell die Bewegung und den Transfer von Ressourcen, Dokumenten, Daten und Aufgaben während des gesamten Arbeitsprozesses, zum Beispiel für ein bestimmtes Projekt oder eine bestimmte Dienstleistung dar.

# IT-Landschaft

- Versionsverwaltung
  - Git
  - GitHub
    Programmiersprachen
    PHP, Sass, TypeScript
    Build Tools
    Jenkins, yarn, node.js buildscript, postcss, autoprefixer, xxhash
    Hosting
    NGINX, namecheap
    Programme
    Visual Studio Code/Visual Studio, node.js, Safari, Chrome, Firefox, Edge, DBeaver

Datenbankverbindung
Datenbank (???)
PHP
Die Datenbankverbindung im PHP-Code wird über das “mysqli” Modul[5] hergestellt, die Verbindungsdaten werden aus Umgebungsvariablen gelesen, damit sie nicht im Code und damit in der Sourceverwaltung sind, das soll verhindern, dass sensible Daten möglicherweise nach außen dringen. Auch wird dadurch ermöglicht, in einem Testsystem eine andere Verbindung zu nutzen, indem lediglich die Umgebungsvariablen angepasst werden müssen.
Die mysqli Klasse in PHP wurde erweitert als “pizzadb”, um spezifische Funktionalität bereitzustellen, wie etwa das Auslesen des Einkaufswagens für Nutzer oder das Löschen dessen, und eine einheitliche Schnittstelle zur Datenbank zu schaffen.
Außerdem wurde der Zugriff auf die Datenbank bzw. die SQL-Statements nur über Prepared-Statements[6], bei denen die Variablen als Parameter betrachtet werden und nicht direkt in den SQL-String geschrieben, um Angriffe via SQL-Injection zu vermeiden, gemacht. Prepared-Statements nehmen anstelle des Wertes einen Platzhalter (‘?’) an derer Stelle dann die Parameter gebunden werden. “SELECT \* FROM user WHERE user = ?”

Tabellenverknüpfungen
Die Basis der Pizza ist die Kategorie in der Tabelle “pizzakategorie”. ,In dieser sind über “zutat_kategorie” Zutaten zugeordnet, welcher aus der Tabelle “zutat” kommen.
Um eine Pizza zu bestellen, muss es einen “user” und einen “Kunden” geben. Der User erhält die Anmeldedaten und der Kunde die persönlichen Daten und eine Verknüpfung zu einem User. Die persönlichen Daten beinhalten auch die Adresse aus der “Wohnort” Tabelle. In der “ZutatenMeiden” Tabelle werden die Zutaten gespeichert, die der Kunde meiden möchte und nicht auf seiner Zufallspizza landen sollen.
Bei Auswahl einer Kategorie bekommt ein Useruser einen “einkaufswagen” zugeordnet. Der Inhalt ders Einkaufswagens findet sich in “einkaufswagen_inhalt”, welcher durch die ausgewählte Kategorie kommt und die Zutaten dann in “einkaufswagen_inhalt_zutat” hinterlegt. Des Weiteren wird eine Größe ausgewählt aus “pizzagroesse” ausgewählt , sie enthält einen Faktor für den Preis und wird mit im “einkaufswagen_inhalt” vermerkt, um den Endpreis zu bilden.
Nachdem der Einkaufswagen dann tatsächlich bestellt wird, wird ein “Bestellkopf” angelegt, dieser stellt die Bestellung in seiner Gesamtheit dar. Ein Bestellkopf hat mehrere “Bestellpositionen”, das sind die einzelnen Pizzen, die sich in der Bestellung befinden. Für jede Bestellposition werden die Zutaten als Bestellpositionszutat hinterlegt. Gleichzeitig mit dem “Bestellkopf” wird ein Eintrag in der Tabelle “BestellungUser” angelegt., Ddieser verknüpft die Bestellposition mit dem Nutzer, um nachvollziehen zu können, welche Bestellungen ein Nutzer getätigt hat. Wenn der Nutzer oder die Bestellposition gelöscht wird, wird automatisch der Eintrag in “BestellungUser” mit gelöscht, da dieser dann keinen Nutzen mehr hat.
Einige Daten werden während des Bestellvorgangs kopiert, zum Beispiel die Zutaten. Das ist eine bewusste Entscheidung, denn wenn zum Beispiel eine Bestellung im “Bestellkopf” angelegt wird, sollten sich die Werte darin ja nicht mehr ändern, denn diese Tabelle wird auch als Historie für den Betreiber genutzt. Selbst wenn Zutaten entfernt werden oder sich die Preise ändern, sollte sich nichts an dieser Tabelle ändern.
ER-Diagramm

Server
NGINX
Der Server, der die Seite antreibt, ist NGINX[7], er nimmt die Anfragen entgegen, sendet statische Dateien zurück und kann auch als Vermittler zu anderen Servern agieren, wie zum Beispiel PHP-FastCGI Process Manager (PHP-FPM)[8], um PHP auszuführen und das Ergebnis wieder zurückzuliefern. Dazu läuft der PHP-FPM Service auf dessen Socket NGINX zugreift und über das FastCGI Protokoll[9] kommuniziert.
NGINX kann basierend auf der Request-URL und der Datei entscheiden, was mit dem Request gemacht werden soll. Die Datei selbst einfach auslesen und zurückgeben, weiterleiten auf eine andere Seite, mit einem spezifischen HTTP-Code antworten oder als Proxy agieren zwischen einem anderen Server und dem Ursprung.
Statische Dateien (JS, TS, WASM, CSS, PNG, JPG, …) werden direkt und mit einem Cache von einem Jahr zurückgegeben, um spätere Requests für dieselbe Datei zu sparen. HTML Dateien werden ohne Cache direkt zurückgegeben und PHP Dateien erst über PHP-FPM verarbeitet.
Jenkins
Jenkins ist ein Automationsserver zum Bauen, Bereitstellen und Automatisieren von Projekten[10].
Er wird hier verwendet, um automatisch alle nötigen Abhängigkeiten der Seite zu laden, die einzelnen Code-Teile zu bauen und danach bereitzustellen.
Über GitHub WebHooks werden, einstellbar, Anfragen nach jedem Commit in den Master Branch an den Jenkins Server gesendet und diesen benachrichtigt, dass es eine Änderung gab. Jenkins lädt sich nun über git clone und pull, mit eventuellen Aufräumarbeiten vorher, um einen sauberen Stand zu gewährleisten, den aktuellen Sourcecode, führt die entsprechenden Befehle aus, um das Projekt zu bauen, mittels NPM/Node-Script (siehe Sprachen - Build-Script), und stellt das Ergebnis bereit für NGINX.
So wird automatisch dafür gesorgt das, wenn ein Commit in den Master Branch kommt sich die Seite aktualisiert und immer den neuesten Stand enthält ohne manuellen Aufwand.

Sprachen (Frank)
TypeScript & JavaScript
TypeScript ist eine Programmiersprache, welche zu JavaScript kompiliert wird. Dieser Code wird bei uns Clientseitig ausgeführt und dient dazu HTML Formulare vor dem Absenden zu validieren oder User-Events abzufangen um eine dynamischere Oberfläche zu bieten.
Zum Beispiel kann man über JavaScript auch CSS Laufzeitvariablen bearbeiten, was neue Möglichkeiten im Bereich der Oberfläche bringt.
Wir haben uns gegen ein UI-Framework entschieden, da die uns bekannten nicht mit PHP kompatibel sind oder einen Bundler benötigen, der nicht mit PHP kompatibel ist.
Build-Script
Auch unser Build-Script ist in JavaScript geschrieben. Dieses kompiliert die Stylesheets und den TypeScript-Code, fügt in den Dateinamen den Hash des Inhaltes (xxHash) mit Basis 36 an und ersetzt in den PHP-Dateien die Quell-Pfade (z.B. ../script/sizeframes.ts) durch den neuen Ziel-Pfad (z.B. ./script/sizeframes-1ibdclf.js).
Basis 36 ist dazu da, damit der Hash nicht so lang ist, damit werden alle Zahlen (0-9) und alle Kleinbuchstaben (a-z) verwendet, um das Ergebnis des xxHash-Algorithmus darzustellen.
Wir haben xxHash verwendet, da dieser wesentlich schneller ist als MD5 oder SHA1.
Der Hash ist dafür da, dass man im Server eine hohe caching-Zeit einstellen kann, denn wenn sich die Datei ändert, ändert sich auch der Hash, wodurch die neue Datei vom Webserver angefragt wird. Wenn die Datei hingegen gleich geblieben ist, ändert sich auch der Hash nicht und der Browser kann die Datei aus dem Cache laden.
Sass
Sass ist eine Sprache für Stylesheets, die zu CSS kompiliert wird, sie existiert mit zwei verschiedenen Syntax, dem Sass und dem Scss Syntax. Sass ähnelt sehr Python, da es keine geschweiften Klammern gibt, sondern alles über das korrekte Einrücken abgegrenzt wird. Scss ist syntaktisch wie CSS, nur eben mit mehr Features.
Sass erweitert die Stylesheets um Features wie geschachtelte Selektoren, Compiletime-Variablen, Compiletime-Funktionen, Compiletime-Kalkulationen, Bibliotheken, Vererbung, Komposition und Imports anderer Dateien.
Wir haben uns für die Scss-Syntax entschieden, da bei Sass schnell Fehler entstehen können, die allein der Formatierung geschuldet sind. Außerdem ist Scss leichter lesbar, wenn man nur CSS kennt.
Import
Mit dem Schlüsselwort @import kann im Sass code eine andere Datei angesprochen werden, diese wird dann ähnlich wie bei einem Include in der Sprache C vom Compiler eingefügt. Dateien, die zum Importieren in andere verwendet werden, markiert man mit einem Unterstrich-Prefix.
Beispiel-Import der Datei \_theme.scss
@import "theme";
Reset
Der Reset dient dazu, dass die Webseite auf allen Browsern gleich aussieht. Jeder Browser hat eigene default-Styles, diese werden in der \_reset.scss zurückgesetzt.
Fazit
Zusammenfassend lässt sich sagen, dass der Pizza Online Bestellservice nach den Rahmenbedingungen und definierten Vorgaben der Projektarbeit entwickelt werden konnte. Mit GitHub konnten über die Bearbeitungszeit diverse „Issues“ erstellt werden, welche nach und nach gelöst wurden. Mit einem Meilenstein in GitHub konnte sich das Team die Entwicklung des Projekts ansehen und gegebenenfalls daran weiter arbeiten. Der Lieferservice kommt mit jeder Erweiterung dem Ziel näher ein realistisches Online-Bestellservice zu werden. Demnach waren die großen Schritte die Erstellung der Registrierungsseite, des Login Systems, des Einkaufswagens, der Profilseite sowie schlussendlich der Homepage und des User-Interface selbst. Bei all diesen Erweiterungen wurden stets Daten in oder aus der Datenbank mit SQL Statements gespeichert, abgerufen, verändert oder gelöscht.
Die Ergebnisse des Login Systems wurden erfolgreich erreicht, indem beim Login die Kundenverifizierung durchgeführt wird und die Anwendung bisher eine User-Anmeldung vorsieht. Vorher kann keine Pizza gewählt und somit nicht bestellt werden. Möglicherweise kann dieses Problem durch eine „Gastbestellung” gelöst werden, sodass ein Kunde sich nicht zwingend registrieren muss.
Ein weiteres Ergebnis ist die Vielfalt der Pizza Kategorien und Belege, die „pizzarando“ seinen Kunden bieten kann. Unsere Kunden sollen alles nach ihrem Geschmack finden können. In virtueller Sicht ist das kein Problem mehrere Kategorien und Zutaten zu generieren. Der Grundgedanke schwindet allerdings, wenn dieser Realität werden soll, denn wirtschaftlich bringt dieses Ziel einige Probleme mit sich.
Bisher wird bei einer Bestellung nur die Barzahlung angeboten, auch hier bieten sich weitere Zahlungsmöglichkeiten an. Zahlung per PayPal oder Lastschrift, sowie Kreditkarte könnten in Betracht gezogen werden, doch auch bei diesen Optionen sind mehr Zeit und Lösungswege notwendig.
Schlussendlich wurde bei „pizzarando“ nicht nur auf die Funktionalität, sondern auch auf das Design und dem Hauptziel einer Zufalls-generierten Pizza gesetzt, welche erfolgreich erreicht wurden.
Mit Pizzarando dürften einige Kunden sehr viel Freude an vielfältigen Pizzen haben.
