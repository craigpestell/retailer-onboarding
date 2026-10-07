import { DetailsForm } from "@/components/DetailsForm";
import { Modal } from "@/components/Modal";

// Opening /details from inside the app shows the form over the current page.
// A direct visit or refresh renders app/details/page.tsx instead.
export default function DetailsModal() {
  return (
    <Modal
      path="/details"
      labelledBy="details-heading"
      closeLabel="Back to checklist"
    >
      <DetailsForm />
    </Modal>
  );
}
