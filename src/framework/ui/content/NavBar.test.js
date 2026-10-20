import {fireEvent, render, screen} from "@testing-library/react";
import {act} from "react";
import {SiteContext} from "./Site";
import {PageContext} from "./Page";
import NavBar from "./NavBar";
import {MemoryRouter} from "react-router";
import * as routerApi from "react-router";

describe('NavBar', () => {

  let mockNavigate; // mocked version of react-router navigation
  let mockedRouterApi

  beforeEach(() => {
    // setup mock router API
    mockNavigate = jest.fn();
    mockedRouterApi = jest.spyOn(routerApi, "useNavigate").mockReturnValue(mockNavigate);
  })

  afterEach(() => {
    // clean up
    mockedRouterApi.mockRestore();
  })

  const mockOutlineData = [
    {PageID: 50, PageTitle: 'First Page', PageRoute: '/firstpage', ParentID: 0, OutlineSeq: '1', HasChildren: true},
    {PageID: 51, PageTitle: 'Second Page', PageRoute: '/secondpage', ParentID: 0, OutlineSeq: '2'},
    {PageID: 52, PageTitle: 'Third Page', PageRoute: '/thirdpage', ParentID: 50, OutlineSeq: '1', HasChildren: true},
    {PageID: 53, PageTitle: 'Fourth Page', PageRoute: '/fourthpage', ParentID: 52, OutlineSeq: '1'}
  ];

  it('Should render correctly', async () => {
    // given
    const mockGetChildren = jest.fn().mockReturnValue([]);

    // when
    await act(async () => {
      render(
        <SiteContext value={{
          getChildren: mockGetChildren,
        }}>
          <PageContext value={{
            pageData: mockOutlineData[0],
            breadcrumbs: []
          }}>
            <MemoryRouter initialEntries={["/"]}>
              <NavBar/>
            </MemoryRouter>
          </PageContext>
        </SiteContext>
      )
    });

    // then
    const navbar = await screen.getByTestId("NavBar");
    expect(navbar).toBeInTheDocument();
    const contents = await screen.getByTestId("NavBarContents");
    expect(contents).toBeInTheDocument();
    const icon = await screen.queryByTestId("NavBarBrandIcon");
    expect(icon).toBeNull();
    const brandText = await screen.queryByTestId("NavBarBrandText");
    expect(brandText).toBeNull();
  })

  it('Should render brand name', async () => {
    // given
    const mockGetChildren = jest.fn().mockReturnValue([]);

    // when
    await act(async () => {
      render(
        <SiteContext value={{
          getChildren: mockGetChildren,
        }}>
          <PageContext value={{
            pageData: mockOutlineData[0],
            breadcrumbs: []
          }}>
            <MemoryRouter initialEntries={["/"]}>
              <NavBar brand={'Brand'}/>
            </MemoryRouter>
          </PageContext>
        </SiteContext>
      )
    });

    // then
    const navbar = await screen.getByTestId("NavBar");
    expect(navbar).toBeInTheDocument();
    const contents = await screen.getByTestId("NavBarContents");
    expect(contents).toBeInTheDocument();
    const icon = await screen.queryByTestId("NavBarBrandIcon");
    expect(icon).toBeNull();
    const brandText = await screen.getByTestId("NavBarBrandText");
    expect(brandText).toBeInTheDocument();
    expect(brandText).toHaveTextContent('Brand');
  })

  it('Should render brand icon', async () => {
    // given
    const mockGetChildren = jest.fn().mockReturnValue([]);
    const mockSiteData = {SiteID: 321, SiteName: 'Mock Site'}
    const mockSiteIcon = '/icon.jpg';

    // when
    await act(async () => {
      render(
        <SiteContext value={{
          getChildren: mockGetChildren,
          siteData: mockSiteData,
        }}>
          <PageContext value={{
            pageData: mockOutlineData[0],
            breadcrumbs: []
          }}>
            <MemoryRouter initialEntries={["/"]}>
              <NavBar icon={mockSiteIcon}/>
            </MemoryRouter>
          </PageContext>
        </SiteContext>
      )
    });

    // then
    const navbar = await screen.getByTestId("NavBar");
    expect(navbar).toBeInTheDocument();
    const contents = await screen.getByTestId("NavBarContents");
    expect(contents).toBeInTheDocument();
    const icon = await screen.queryByTestId("NavBarBrandIcon");
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("src", mockSiteIcon);
    expect(icon).toHaveAttribute("alt", mockSiteData.SiteName);
    const brandText = await screen.queryByTestId("NavBarBrandText");
    expect(brandText).toBeNull();
  })

  it('Should navigate to root on icon click', async () => {
    // given
    const mockGetChildren = jest.fn().mockReturnValue([]);
    const mockSiteData = {SiteID: 321, SiteName: 'Mock Site'}
    const mockSiteIcon = '/icon.jpg';

    // when
    await act(async () => {
      render(
        <SiteContext value={{
          getChildren: mockGetChildren,
          siteData: mockSiteData,
        }}>
          <PageContext value={{
            pageData: mockOutlineData[0],
            breadcrumbs: []
          }}>
            <MemoryRouter initialEntries={["/"]}>
              <NavBar icon={mockSiteIcon}/>
            </MemoryRouter>
          </PageContext>
        </SiteContext>
      )
    });
    const icon = await screen.queryByTestId("NavBarBrandIcon");
    fireEvent.click(icon);

    // then
    expect(icon).toBeInTheDocument();
    expect(mockNavigate).toBeCalledWith('/');
  })

  it('Should navigate to root on brand text click', async () => {
    // given
    const mockGetChildren = jest.fn().mockReturnValue([]);
    const mockSiteData = {SiteID: 321, SiteName: 'Mock Site'}

    // when
    await act(async () => {
      render(
        <SiteContext value={{
          getChildren: mockGetChildren,
          siteData: mockSiteData,
        }}>
          <PageContext value={{}}>
            <MemoryRouter initialEntries={["/"]}>
              <NavBar brand={'Mock Brand'}/>
            </MemoryRouter>
          </PageContext>
        </SiteContext>
      )
    });
    const text = await screen.queryByTestId("NavBarBrandText");
    fireEvent.click(text);

    // then
    expect(text).toBeInTheDocument();
    expect(mockNavigate).toBeCalledWith('/');
  })

  it('Should build dropdowns from outline', async () => {
    // given
    const mockGetChildren = jest.fn()
      .mockReturnValueOnce([mockOutlineData[0], mockOutlineData[1]])
      .mockReturnValueOnce([mockOutlineData[2]])
      .mockReturnValueOnce([mockOutlineData[3]])
      .mockReturnValue([]);
    const mockBreadcrumbs = [mockOutlineData[0], mockOutlineData[2]];
    const mockSiteData = {SiteID: 321, SiteName: 'Mock Site'}

    // when
    await act(async () => {
      render(
        <SiteContext value={{
          getChildren: mockGetChildren,
          siteData: mockSiteData,
        }}>
          <PageContext value={{
            pageData: mockOutlineData[3],
            breadcrumbs: mockBreadcrumbs,
          }}>
            <MemoryRouter initialEntries={["/pagefour"]}>
              <NavBar/>
            </MemoryRouter>
          </PageContext>
        </SiteContext>
      )
    });

    // then
    const link1 = await screen.findByTestId("NavItem-50");
    expect(link1).toBeInTheDocument();
    const link2 = await screen.findByTestId("NavItem-51");
    expect(link2).toBeInTheDocument();
    // const link3 = await screen.findByTestId("NavItem-52");
    // expect(link3).toBeInTheDocument();
    // const link4 = await screen.findByTestId("NavItem-53");
    // expect(link4).toBeInTheDocument();
    expect(mockGetChildren).toHaveBeenNthCalledWith(1, 0);
    expect(mockGetChildren).toHaveBeenNthCalledWith(2, 50);
    // expect(mockGetChildren).toHaveBeenNthCalledWith(3, 51);
  })
})