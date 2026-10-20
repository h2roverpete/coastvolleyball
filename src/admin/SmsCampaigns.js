import {useEffect, useState} from "react";
import {useSiteContext} from "framework/ui/content/Site";
import {useAuth} from "framework/auth/AuthProvider";
import {Permission, Resource} from "framework/auth/Permissions";
import SmsCampaignList from "framework/ui/sms/SmsCampaignList";

export default function SmsCampaigns({pageId}) {

  // imports
  const {currentPage} = useSiteContext();
  const {hasPermission} = useAuth();

  // states
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    setCanEdit(hasPermission?.(Resource.SITE, Permission.ADMIN));
  }, [setCanEdit, hasPermission]);

  return <>
    {currentPage?.PageID === pageId && canEdit && <>
      <SmsCampaignList />
    </>}
  </>;
}