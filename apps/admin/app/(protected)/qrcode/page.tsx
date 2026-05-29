import { getActiveRestaurantId, listRestaurants } from "@/lib/active-restaurant";
import { publicSiteOrigin } from "@/lib/restaurants-shared";
import { PageHeader } from "@/components/PageHeader";
import { listQrCodes } from "@/lib/data/qrcodes";
import { QrCodeManager } from "@/components/QrCodeManager";
import { createQrCode, deleteQrCode } from "./actions";

export const dynamic = "force-dynamic";

export default async function QrCodePage() {
  const restaurantId = getActiveRestaurantId();
  const [codes, restaurants] = await Promise.all([listQrCodes(restaurantId), listRestaurants()]);

  return (
    <section className="flex w-full flex-col gap-6">
      <PageHeader
        title="QR Codes"
        description="Gere QR codes rastreados pro cardápio. Cada QR tem a própria contagem de visitas — sem sistema separado: a origem entra no mesmo Analytics, sem duplicar."
      />
      <div className="admin-card p-6 sm:p-8">
        <QrCodeManager
          codes={codes}
          restaurants={restaurants}
          origin={publicSiteOrigin()}
          onCreate={createQrCode}
          onDelete={deleteQrCode}
        />
      </div>
    </section>
  );
}
