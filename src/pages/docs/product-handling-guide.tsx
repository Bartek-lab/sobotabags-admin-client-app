import { useState } from "react";
import { Alert, Collapse, Segmented, Table, Tag, Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

const sortOrderRowsEn = [
  { scope: "categories.sort_order", controls: "Order of sibling categories under the same parent (nav/tree)." },
  { scope: "product_categories.sort_order", controls: "Order of a product within one specific category's listing." },
  {
    scope: "attributes.sort_order",
    controls: "Order attribute fields appear in when editing a product or a variant. Set on the attribute's own edit screen.",
  },
  {
    scope: "product_type_attributes.sort_order",
    controls: "Order of rows in the Product Type's own attribute-management table only — does not affect field order on the product/variant edit screen.",
  },
  { scope: "attribute_options.sort_order", controls: "Order of select/multiselect options in a dropdown (e.g. color swatches)." },
  { scope: "product_media.sort_order", controls: "Order of a product's images — the first one is the storefront listing image." },
  { scope: "product_variants.sort_order", controls: "Order variants are listed in on the product edit screen." },
];

const sortOrderRowsPl = [
  { scope: "categories.sort_order", controls: "Kolejność kategorii-rodzeństwa pod tym samym rodzicem (drzewo/nawigacja)." },
  { scope: "product_categories.sort_order", controls: "Kolejność produktu w obrębie listingu jednej konkretnej kategorii." },
  {
    scope: "attributes.sort_order",
    controls: "Kolejność pól atrybutów przy edycji produktu lub wariantu. Ustawiane na ekranie edycji samego atrybutu.",
  },
  {
    scope: "product_type_attributes.sort_order",
    controls: "Kolejność wierszy wyłącznie w tabeli zarządzania atrybutami na ekranie Product Type — nie wpływa na kolejność pól przy edycji produktu/wariantu.",
  },
  { scope: "attribute_options.sort_order", controls: "Kolejność opcji select/multiselect w rozwijanej liście (np. próbki kolorów)." },
  { scope: "product_media.sort_order", controls: "Kolejność zdjęć produktu — pierwsze jest zdjęciem listingowym w sklepie." },
  { scope: "product_variants.sort_order", controls: "Kolejność wariantów na liście na ekranie edycji produktu." },
];

const dataTypeRowsEn = [
  { type: "text / rich_text", renders: "Plain input / textarea", notes: "rich_text isn't actually sanitized/rendered as HTML anywhere yet — treat it as long plain text for now." },
  { type: "number", renders: "Numeric input", notes: "Has an optional unit (e.g. \"cm\") set on the attribute itself." },
  { type: "boolean", renders: "Checkbox", notes: "e.g. fits_laptop, bestseller." },
  { type: "date", renders: "Date picker", notes: "" },
  { type: "select", renders: "Single-choice dropdown", notes: "Needs Options added on the attribute's edit screen first." },
  { type: "multiselect", renders: "Multi-choice dropdown", notes: "Product-level only — not valid for a variant-level attribute (rejected)." },
];

const dataTypeRowsPl = [
  { type: "text / rich_text", renders: "Zwykłe pole tekstowe / textarea", notes: "rich_text nie jest jeszcze nigdzie faktycznie sanityzowane/renderowane jako HTML — na razie traktuj jak zwykły, dłuższy tekst." },
  { type: "number", renders: "Pole liczbowe", notes: "Opcjonalna jednostka (np. \"cm\") ustawiana na samym atrybucie." },
  { type: "boolean", renders: "Checkbox", notes: "np. fits_laptop, bestseller." },
  { type: "date", renders: "Wybór daty", notes: "" },
  { type: "select", renders: "Lista rozwijana, jeden wybór", notes: "Wymaga wcześniejszego dodania Options na ekranie edycji atrybutu." },
  { type: "multiselect", renders: "Lista rozwijana, wiele wyborów", notes: "Tylko na poziomie produktu — niedozwolone dla atrybutu na poziomie wariantu (zostanie odrzucone)." },
];

const EnglishContent = () => {
  const items = [
    {
      key: "hierarchy",
      label: "The hierarchy, end to end",
      children: (
        <>
          <Paragraph>
            <pre style={{ background: "#fafafa", padding: 12, borderRadius: 6, fontSize: 12.5, overflowX: "auto" }}>
{`Product Type (e.g. "Handbag")
  └── has Attributes attached at a level:
        ├── "product" → one value for the whole product (e.g. material)
        └── "variant" → one value per variant (e.g. color, size, width in mm) -- set when creating
                         the variant itself, whether or not it's a customer-facing choice

Product (a real listing, e.g. "Shopper Bea")
  ├── Translation (name, slug, description — Polish only for now)
  ├── Images (ordered, first = storefront listing image)
  ├── product-level Attribute values
  ├── Categories (which storefront sections it shows in)
  └── Variants ← what customers actually buy: SKU, price, stock, + variant-level attribute values`}
            </pre>
          </Paragraph>
          <Paragraph>
            <b>Rule of thumb: attribute = a column, variant = a row.</b> "Color" and "Size" are attributes — but
            "Black, size M, SKU BAG-001, 450 zł, 3 in stock" is a <i>variant</i>: a real, buyable thing with its own
            price and stock. A product with zero variants can't be sold.
          </Paragraph>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message="Existing color/size attributes"
            description={
              <>
                Color and size were originally attached at a separate "variant axis" level, since removed from the
                attach-a-new-attribute screen as unneeded complexity — new attributes can only be attached as
                "product" or "variant" now. Existing ones keep working exactly as before; the only practical
                difference is that <i>Copy</i> on a variant still clears color/size specifically (so you're forced to
                pick a new one) but would carry over a value on any newly-attached variant-level attribute, since
                there's no longer a distinction to key that behavior off of.
              </>
            }
          />
        </>
      ),
    },
    {
      key: "steps",
      label: "Step by step: adding a new product",
      children: (
        <ol style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>
            <b>Product Types</b> → confirm a matching type exists (e.g. "Handbag"). If not, create one (just code +
            name).
          </li>
          <li>
            On that type's edit screen, under <i>Attributes</i>, confirm every attribute you'll need is attached, at
            the right level (product / variant). Missing one? Create it first under{" "}
            <b>Attributes → Create</b> (pick a data type — see the table below), then attach it to the type here.
          </li>
          <li>
            <b>Products → Create</b>: pick the product type, save. You land on the edit screen — everything else
            happens there.
          </li>
          <li>
            <b>Weight/Length/Width/Height</b> at the top of the edit screen: the shipping package's physical
            dimensions. One set per product, not per variant — color doesn't change the box.
          </li>
          <li>
            <b>Images</b>: upload (jpeg/png/webp, min 800×800px, max 5MB, up to 5). First image = storefront listing
            image.
          </li>
          <li>
            <b>Translations</b>: name, slug, descriptions. Only Polish is active for now. Meta title/description are
            optional — leave them blank and they're auto-filled from name/short description on save.
          </li>
          <li>
            <b>Categories</b>: tick every category this product should appear in; optionally mark one primary. A
            category only actually shows the product on the storefront once that category itself has a translation
            with a slug — if you see a <Tag color="warning">no translation yet</Tag> tag here, fix that on the
            category's own edit screen first.
          </li>
          <li>
            <b>Attributes</b> card: fill in product-level values (material, bestseller flag, etc).
          </li>
          <li>
            <b>Variants</b>: add at least one — SKU, price, stock, plus variant-level attribute values (color,
            size…). Use <i>Copy</i> to add another color/size of the same bag quickly — it carries over price; for
            color/size specifically it still clears those two so you're forced to pick a new one, since those have
            to differ between variants.
          </li>
          <li>
            Flip <b>Status</b> to Active once everything above is filled in — a product can't be published without
            it.
          </li>
        </ol>
      ),
    },
    {
      key: "attributes",
      label: "Attributes: data types and levels",
      children: (
        <>
          <Paragraph>
            Every attribute has a <b>data type</b>, which decides how it's edited:
          </Paragraph>
          <Table
            size="small"
            pagination={false}
            dataSource={dataTypeRowsEn}
            rowKey="type"
            columns={[
              { title: "data_type", dataIndex: "type" },
              { title: "Renders as", dataIndex: "renders" },
              { title: "Notes", dataIndex: "notes" },
            ]}
            style={{ marginBottom: 16 }}
          />
          <Paragraph>
            And a <b>level</b>, set when attaching it to a product type (not on the attribute itself — the same
            attribute could in theory be product-level on one type and variant-level on another):
          </Paragraph>
          <ul>
            <li>
              <Text code>product</Text> — one value for the whole product, editable on the product's own Attributes
              card.
            </li>
            <li>
              <Text code>variant</Text> — one value per variant, filled in on that variant (customer-facing choices
              like color/size and fixed values like exact width in mm are both this level — there's no separate
              distinction anymore).
            </li>
          </ul>
          <Alert
            type="info"
            showIcon
            message="Translatable attributes aren't editable through this UI yet"
            description="A text/rich_text attribute marked 'translatable' won't show up on the product edit form — that path isn't wired up in this pass. Keep translatable attributes untranslatable (plain text) unless you specifically need per-locale values, in which case ask for this to be built out."
          />
        </>
      ),
    },
    {
      key: "sort-order",
      label: "Sort order — where each one applies",
      children: (
        <>
          <Paragraph>
            "Sort order" isn't one concept — it's a repeated pattern, each instance scoped to its own context. None
            of them reference each other.
          </Paragraph>
          <Table
            size="small"
            pagination={false}
            dataSource={sortOrderRowsEn}
            rowKey="scope"
            columns={[
              { title: "Field", dataIndex: "scope", render: (v) => <Text code>{v}</Text> },
              { title: "Controls", dataIndex: "controls" },
            ]}
          />
          <Alert
            style={{ marginTop: 12 }}
            type="warning"
            showIcon
            message="A known mismatch"
            description={
              <>
                Reordering attributes on the <b>Product Type</b> screen only reorders that management table — it
                does <i>not</i> change the order fields appear in on the product/variant edit form. To change that,
                edit the <Text code>sort_order</Text> on the <b>attribute itself</b> (Attributes → edit).
              </>
            }
          />
        </>
      ),
    },
    {
      key: "categories",
      label: "Categories: hierarchy and storefront visibility",
      children: (
        <>
          <Paragraph>
            Categories form a tree via <i>parent category</i> — purely structural (nav/breadcrumbs), set on a
            category's own edit screen. Each category has exactly one parent (or none); a category list in the
            admin shows two tables, "Parent categories" above "Child categories" (the latter with a column showing
            which parent each belongs to), rather than one flat list.
          </Paragraph>
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message="Parent/child does not cascade to products"
            description={
              <>
                Browsing a parent category shows only products assigned <i>directly</i> to that exact category — a
                product only in a child category will not appear when browsing the parent. If a bag should show
                under both, tick both boxes on the product's Categories card.
              </>
            }
          />
          <Paragraph>
            A category is invisible on the storefront until it has a <b>translation</b> (name + slug) — the
            category list/picker flags this with a <Tag color="warning">no translation yet</Tag> tag. The
            storefront filters products by slug (<Text code>GET /products?category=&lt;slug&gt;</Text>), so the slug
            has to match whatever link points at it (e.g. the homepage's women/men sections link to slugs{" "}
            <Text code>women</Text>/<Text code>men</Text> specifically).
          </Paragraph>
        </>
      ),
    },
    {
      key: "special-flags",
      label: "Special flags: bestseller",
      children: (
        <Paragraph>
          "Bestseller" is a plain <Text code>boolean</Text> product-level attribute, same mechanism as any other
          attribute — tick it on a product's Attributes card. The homepage's "Bestsellery kolekcji" section shows
          whichever products have it checked (newest-first among them), nothing more exotic than that.
        </Paragraph>
      ),
    },
  ];

  return (
    <Collapse bordered={false} defaultActiveKey={["hierarchy", "steps"]} items={items} />
  );
};

const PolishContent = () => {
  const items = [
    {
      key: "hierarchy",
      label: "Hierarchia od A do Z",
      children: (
        <>
          <Paragraph>
            <pre style={{ background: "#fafafa", padding: 12, borderRadius: 6, fontSize: 12.5, overflowX: "auto" }}>
{`Typ produktu (np. "Torebka")
  └── ma przypięte Atrybuty na poziomie:
        ├── "product" → jedna wartość dla całego produktu (np. materiał)
        └── "variant" → jedna wartość na wariant (np. kolor, rozmiar, szerokość w mm) -- ustawiana przy
                         tworzeniu samego wariantu, niezależnie czy to wybór klienta czy nie

Produkt (realny listing, np. "Shopper Bea")
  ├── Tłumaczenie (nazwa, slug, opis — na razie tylko polski)
  ├── Zdjęcia (uporządkowane, pierwsze = zdjęcie listingowe w sklepie)
  ├── Wartości atrybutów na poziomie produktu
  ├── Kategorie (w których sekcjach sklepu się pojawia)
  └── Warianty ← to, co klient realnie kupuje: SKU, cena, stan magazynowy + wartości atrybutów na poziomie wariantu`}
            </pre>
          </Paragraph>
          <Paragraph>
            <b>Zasada: atrybut to kolumna, wariant to wiersz.</b> "Kolor" i "Rozmiar" to atrybuty — ale "Czarny,
            rozmiar M, SKU BAG-001, 450 zł, 3 szt. na stanie" to <i>wariant</i>: realna, kupowalna rzecz z własną
            ceną i stanem magazynowym. Produkt bez żadnego wariantu nie może zostać sprzedany.
          </Paragraph>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message="Istniejące atrybuty kolor/rozmiar"
            description={
              <>
                Kolor i rozmiar były pierwotnie przypięte na odrębnym poziomie "variant axis", usuniętym z ekranu
                dodawania nowego atrybutu jako niepotrzebna złożoność -- nowe atrybuty można przypinać tylko jako
                "product" lub "variant". Istniejące działają dalej bez zmian; jedyna praktyczna różnica: funkcja{" "}
                <i>Copy</i> na wariancie wciąż czyści konkretnie kolor/rozmiar (żeby wymusić wybranie nowego), ale
                skopiuje wartość dowolnego nowo przypiętego atrybutu na poziomie wariantu, bo nie ma już rozróżnienia,
                po którym mogłaby się kierować.
              </>
            }
          />
        </>
      ),
    },
    {
      key: "steps",
      label: "Krok po kroku: dodawanie nowego produktu",
      children: (
        <ol style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>
            <b>Product Types</b> → sprawdź, czy istnieje pasujący typ (np. "Handbag"). Jeśli nie — utwórz go (tylko
            code + name).
          </li>
          <li>
            Na ekranie edycji tego typu, w sekcji <i>Attributes</i>, upewnij się, że każdy potrzebny atrybut jest
            przypięty, na właściwym poziomie (product / variant). Brakuje atrybutu? Utwórz go
            najpierw w <b>Attributes → Create</b> (wybierz typ danych — patrz tabela niżej), potem przypnij go tutaj.
          </li>
          <li>
            <b>Products → Create</b>: wybierz typ produktu, zapisz. Trafisz na ekran edycji — reszta dzieje się tam.
          </li>
          <li>
            <b>Weight/Length/Width/Height</b> na górze ekranu edycji: fizyczne wymiary paczki wysyłkowej. Jeden
            zestaw na produkt, nie na wariant — kolor nie zmienia rozmiaru pudełka.
          </li>
          <li>
            <b>Zdjęcia</b>: wgraj (jpeg/png/webp, min 800×800px, max 5MB, do 5 sztuk). Pierwsze zdjęcie = zdjęcie
            listingowe w sklepie.
          </li>
          <li>
            <b>Tłumaczenia</b>: nazwa, slug, opisy. Na razie aktywny jest tylko polski. Meta title/description są
            opcjonalne — zostaw je puste, a zostaną automatycznie uzupełnione z nazwy/krótkiego opisu przy zapisie.
          </li>
          <li>
            <b>Kategorie</b>: zaznacz każdą kategorię, w której produkt ma się pojawić; opcjonalnie oznacz jedną jako
            główną. Kategoria pokaże produkt w sklepie dopiero, gdy ta kategoria sama ma tłumaczenie ze slugiem —
            jeśli widzisz tu znacznik <Tag color="warning">no translation yet</Tag>, popraw to najpierw na ekranie
            edycji tej kategorii.
          </li>
          <li>
            Karta <b>Attributes</b>: uzupełnij wartości na poziomie produktu (materiał, flaga bestseller itd).
          </li>
          <li>
            <b>Warianty</b>: dodaj co najmniej jeden — SKU, cena, stan magazynowy, plus wartości atrybutów na
            poziomie wariantu (kolor, rozmiar...). Użyj <i>Copy</i>, żeby szybko dodać kolejny kolor/rozmiar tej
            samej torby — kopiuje cenę; kolor/rozmiar konkretnie wciąż są czyszczone, bo te muszą się różnić między
            wariantami.
          </li>
          <li>
            Ustaw <b>Status</b> na Active, gdy wszystko powyżej jest uzupełnione — produkt nie może zostać
            opublikowany bez tego.
          </li>
        </ol>
      ),
    },
    {
      key: "attributes",
      label: "Atrybuty: typy danych i poziomy",
      children: (
        <>
          <Paragraph>
            Każdy atrybut ma <b>typ danych</b>, który decyduje, jak się go edytuje:
          </Paragraph>
          <Table
            size="small"
            pagination={false}
            dataSource={dataTypeRowsPl}
            rowKey="type"
            columns={[
              { title: "data_type", dataIndex: "type" },
              { title: "Wyświetla się jako", dataIndex: "renders" },
              { title: "Uwagi", dataIndex: "notes" },
            ]}
            style={{ marginBottom: 16 }}
          />
          <Paragraph>
            Oraz <b>poziom</b>, ustawiany przy przypinaniu go do typu produktu (nie na samym atrybucie — ten sam
            atrybut teoretycznie mógłby być na poziomie produktu w jednym typie, a wariantu w innym):
          </Paragraph>
          <ul>
            <li>
              <Text code>product</Text> — jedna wartość dla całego produktu, edytowana w karcie Attributes na
              produkcie.
            </li>
            <li>
              <Text code>variant</Text> — jedna wartość na wariant, uzupełniana przy tym wariancie (zarówno wybór
              klienta jak kolor/rozmiar, jak i wartość ustalona np. dokładna szerokość w mm — to teraz ten sam
              poziom, bez rozróżnienia).
            </li>
          </ul>
          <Alert
            type="info"
            showIcon
            message="Atrybuty tłumaczalne nie są jeszcze edytowalne w tym UI"
            description="Atrybut tekstowy/rich_text oznaczony jako 'translatable' nie pojawi się na formularzu edycji produktu -- ta ścieżka nie jest jeszcze podłączona. Zostaw atrybuty jako nietłumaczalne (zwykły tekst), chyba że faktycznie potrzebujesz wartości per język -- wtedy zgłoś, żeby to dobudować."
          />
        </>
      ),
    },
    {
      key: "sort-order",
      label: "Kolejność sortowania (sort order) — gdzie co kontroluje",
      children: (
        <>
          <Paragraph>
            "Sort order" to nie jeden koncept — to powtarzający się wzorzec, każde wystąpienie niezależne, przypięte
            do swojego kontekstu. Żadne z nich się nawzajem nie odwołują.
          </Paragraph>
          <Table
            size="small"
            pagination={false}
            dataSource={sortOrderRowsPl}
            rowKey="scope"
            columns={[
              { title: "Pole", dataIndex: "scope", render: (v) => <Text code>{v}</Text> },
              { title: "Kontroluje", dataIndex: "controls" },
            ]}
          />
          <Alert
            style={{ marginTop: 12 }}
            type="warning"
            showIcon
            message="Znana niespójność"
            description={
              <>
                Przestawianie atrybutów na ekranie <b>Product Type</b> zmienia kolejność wyłącznie w tej tabeli
                zarządzania — <i>nie</i> zmienia kolejności, w jakiej pola pojawiają się na formularzu edycji
                produktu/wariantu. Żeby to zmienić, edytuj <Text code>sort_order</Text> na{" "}
                <b>samym atrybucie</b> (Attributes → edit).
              </>
            }
          />
        </>
      ),
    },
    {
      key: "categories",
      label: "Kategorie: hierarchia i widoczność w sklepie",
      children: (
        <>
          <Paragraph>
            Kategorie tworzą drzewo poprzez <i>parent category</i> — to czysto strukturalne (nawigacja/breadcrumbs),
            ustawiane na ekranie edycji samej kategorii. Każda kategoria ma co najwyżej jednego rodzica; lista
            kategorii w panelu pokazuje dwie tabele, "Parent categories" nad "Child categories" (ta druga z kolumną
            wskazującą rodzica), a nie jedną płaską listę.
          </Paragraph>
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message="Rodzic/dziecko nie kaskaduje na produkty"
            description={
              <>
                Przeglądanie kategorii-rodzica pokazuje tylko produkty przypisane <i>bezpośrednio</i> do tej
                dokładnej kategorii — produkt tylko w kategorii-dziecku nie pojawi się przy przeglądaniu rodzica.
                Jeśli torba ma się pokazywać w obu, zaznacz oba checkboxy w karcie Categories na produkcie.
              </>
            }
          />
          <Paragraph>
            Kategoria jest niewidoczna w sklepie, dopóki nie ma <b>tłumaczenia</b> (nazwa + slug) — lista/picker
            kategorii oznacza to znacznikiem <Tag color="warning">no translation yet</Tag>. Sklep filtruje produkty
            po slugu (<Text code>GET /products?category=&lt;slug&gt;</Text>), więc slug musi pasować do tego, co
            wskazuje dany link (np. sekcje damskie/męskie na stronie głównej linkują konkretnie do slugów{" "}
            <Text code>women</Text>/<Text code>men</Text>).
          </Paragraph>
        </>
      ),
    },
    {
      key: "special-flags",
      label: "Specjalne flagi: bestseller",
      children: (
        <Paragraph>
          "Bestseller" to zwykły atrybut <Text code>boolean</Text> na poziomie produktu, dokładnie ten sam
          mechanizm co każdy inny atrybut — zaznacz go w karcie Attributes na produkcie. Sekcja "Bestsellery
          kolekcji" na stronie głównej pokazuje te produkty, które mają go zaznaczonego (od najnowszych) — nic
          bardziej skomplikowanego.
        </Paragraph>
      ),
    },
  ];

  return (
    <Collapse bordered={false} defaultActiveKey={["hierarchy", "steps"]} items={items} />
  );
};

export const ProductHandlingGuide = () => {
  const [lang, setLang] = useState<"en" | "pl">("en");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <Title level={5} style={{ marginTop: 0, marginBottom: 0 }}>
          Product handling: categories, attributes, sort orders, data types
        </Title>
        <Segmented
          value={lang}
          onChange={(v) => setLang(v as "en" | "pl")}
          options={[
            { label: "English", value: "en" },
            { label: "Polski", value: "pl" },
          ]}
        />
      </div>
      {lang === "en" ? <EnglishContent /> : <PolishContent />}
    </div>
  );
};
