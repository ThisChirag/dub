import useWorkspace from "@/lib/swr/use-workspace";
import { OAuthAppProps } from "@/lib/types";
import {
  BlurImage,
  Button,
  ButtonProps,
  InfoTooltip,
  Logo,
  Modal,
} from "@dub/ui";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { mutate } from "swr";

const newApp: OAuthAppProps = {
  name: "",
  developer: "",
  website: "",
  clientId: "",
  redirectUri: "",
};

function AddEditAppModal({
  showAddEditAppModal,
  setShowAddEditAppModal,
  app,
  onAppCreated,
}: {
  showAddEditAppModal: boolean;
  setShowAddEditAppModal: Dispatch<SetStateAction<boolean>>;
  app?: OAuthAppProps;
  onAppCreated?: (App: OAuthAppProps) => void;
}) {
  const [saving, setSaving] = useState(false);
  const { id: workspaceId, logo, slug } = useWorkspace();
  const [data, setData] = useState<OAuthAppProps>(app || newApp);

  // Determine the endpoint
  const endpoint = useMemo(() => {
    if (app) {
      return {
        method: "PATCH",
        url: `/api/oauth-apps/${app.clientId}?workspaceId=${workspaceId}`,
        successMessage: "OAuth app updated!",
      };
    } else {
      return {
        method: "POST",
        url: `/api/oauth-apps?workspaceId=${workspaceId}`,
        successMessage: "OAuth app created!",
      };
    }
  }, [app]);

  // Save the form data
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const response = await fetch(endpoint.url, {
      method: endpoint.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok) {
      mutate(`/api/oauth-apps?workspaceId=${workspaceId}`);
      toast.success(endpoint.successMessage);
      onAppCreated?.(result);
      setShowAddEditAppModal(false);
    } else {
      toast.error(result.error.message);
      setSaving(false);
    }
  };

  const { name, developer, website, redirectUri } = data;
  const buttonDisabled = !name || !developer || !website || !redirectUri;

  return (
    <>
      <Modal
        showModal={showAddEditAppModal}
        setShowModal={setShowAddEditAppModal}
        className="scrollbar-hide h-fit max-h-[95vh] overflow-auto"
      >
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 px-4 py-4 pt-8 sm:px-16">
          {logo ? (
            <BlurImage
              src={logo}
              alt={`Logo for ${slug}`}
              className="h-10 w-10 rounded-full border border-gray-200"
              width={20}
              height={20}
            />
          ) : (
            <Logo />
          )}
          <h1 className="text-lg font-medium">
            {app ? "Update" : "Add New"} OAuth Application
          </h1>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 text-left sm:px-10"
        >
          <div>
            <label htmlFor="name" className="flex items-center space-x-2">
              <h2 className="text-sm font-medium text-gray-900">
                Application name
              </h2>
              <InfoTooltip content="Application name will be displayed in the OAuth consent screen" />
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <input
                className="block w-full rounded-md border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                required
                value={name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                autoFocus
                autoComplete="off"
                placeholder="My App"
              />
            </div>
          </div>

          <div>
            <label htmlFor="developer" className="flex items-center space-x-2">
              <h2 className="text-sm font-medium text-gray-900">
                Developer name
              </h2>
              <InfoTooltip content="The person or company developing this application" />
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <input
                className="block w-full rounded-md border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                required
                value={developer}
                onChange={(e) =>
                  setData({ ...data, developer: e.target.value })
                }
                placeholder="Acme Inc."
              />
            </div>
          </div>

          <div>
            <label htmlFor="website" className="flex items-center space-x-2">
              <h2 className="text-sm font-medium text-gray-900">Website URL</h2>
              <InfoTooltip content="URL to the developer's website or documentation" />
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <input
                className="block w-full rounded-md border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                type="url"
                required
                value={website}
                onChange={(e) => setData({ ...data, website: e.target.value })}
                placeholder="https://acme.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="redirectUri"
              className="flex items-center space-x-2"
            >
              <h2 className="text-sm font-medium text-gray-900">
                Callback URL
              </h2>
              <InfoTooltip content="URL to redirect the user after authentication. Must use HTTPS, except for localhost" />
            </label>
            <div className="relative mt-2 rounded-md shadow-sm">
              <input
                className="block w-full rounded-md border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                type="url"
                required
                value={redirectUri}
                onChange={(e) =>
                  setData({ ...data, redirectUri: e.target.value })
                }
                placeholder="https://acme.com/callback"
              />
            </div>
          </div>

          <Button
            text={app ? "Save changes" : "Create"}
            disabled={buttonDisabled}
            loading={saving}
          />
        </form>
      </Modal>
    </>
  );
}

function AddAppButton({
  setShowAddEditAppModal,
  buttonProps,
}: {
  setShowAddEditAppModal: Dispatch<SetStateAction<boolean>>;
  buttonProps?: Partial<ButtonProps>;
}) {
  return (
    <div>
      <Button
        text="Create"
        onClick={() => setShowAddEditAppModal(true)}
        {...buttonProps}
      />
    </div>
  );
}

export function useAddEditAppModal(
  {
    app,
    onAppCreated,
  }: {
    app?: OAuthAppProps;
    onAppCreated?: (App: OAuthAppProps) => void;
  } = { onAppCreated: () => {} },
) {
  const [showAddEditAppModal, setShowAddEditAppModal] = useState(false);

  const AddEditAppModalCallback = useCallback(() => {
    return (
      <AddEditAppModal
        showAddEditAppModal={showAddEditAppModal}
        setShowAddEditAppModal={setShowAddEditAppModal}
        app={app}
        onAppCreated={onAppCreated}
      />
    );
  }, [showAddEditAppModal, setShowAddEditAppModal]);

  const AddAppButtonCallback = useCallback(() => {
    return <AddAppButton setShowAddEditAppModal={setShowAddEditAppModal} />;
  }, [setShowAddEditAppModal]);

  return useMemo(
    () => ({
      setShowAddEditAppModal,
      AddEditAppModal: AddEditAppModalCallback,
      AddAppButton: AddAppButtonCallback,
    }),
    [setShowAddEditAppModal, AddEditAppModalCallback, AddAppButtonCallback],
  );
}
