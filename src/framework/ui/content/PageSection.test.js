import {act} from "react";
import {render, screen} from "@testing-library/react";
import PageSection from "./PageSection";

describe('PageSection', () => {

  let mockSectionData, mockSiteData;

  beforeEach(() => {

    mockSiteData = {
      SiteID: undefined,
      SiteName: undefined,
      SiteRootUrl: undefined,
      SiteRootDir: undefined,
      PageDisplayURL: undefined,
      ColorSchemeID: undefined,
      FrameID: undefined,
      AddSections: undefined,
      EditOutline: undefined,
      OutlineDepthLimit: undefined,
      AddDeletePages: undefined,
      PageImage1Label: undefined,
      PageImage2Label: undefined,
      RealmID: undefined,
      Created: undefined,
      Modified: undefined,
    }

    mockSectionData = {
      PageSectionID: undefined,
      PageID: undefined,
      PageSectionSeq: undefined,
      SectionTitle: undefined,
      SectionText: undefined,
      SectionImage: undefined,
      SectionHidden: undefined,
      ImageWidth: undefined,
      ImageHeight: undefined,
      ImageURL: undefined,
      ImageURLTarget: undefined,
      ColSpan: undefined,
      ColumnWidth: undefined,
      HideImageFrame: undefined,
      TitleAlign: undefined,
      TextAlign: undefined,
      TextVAlign: undefined,
      ImageAlign: undefined,
      ImageVAlign: undefined,
      ImagePosition: undefined,
      ShowTitle: undefined,
      ShowText: undefined,
      ShowImage: undefined,
      DontMash: undefined,
      Created: undefined,
      Modified: undefined,
    }
  })

  it('should render', async () => {
    // given
    mockSectionData.PageSectionID = 1234;

    // when
    await act(async () => {
      render(
        <PageSection siteData={mockSiteData} sectionData={mockSectionData}/>
      );
    })

    // then
    const element = await screen.getByTestId(/PageSection-1234/i);
    expect(element).toBeInTheDocument();
  });

  it('should show title', async () => {
    // given
    mockSectionData.PageSectionID = 1234;
    mockSectionData.SectionTitle = 'Section Title';
    mockSectionData.ShowTitle = true;

    // when
    await act(async () => {
      render(
        <PageSection siteData={mockSiteData} sectionData={mockSectionData}/>
      );
    })

    // then
    const element = await screen.getByText(/Section Title/i);
    expect(element).toBeInTheDocument();
  });

  it('should hide title when ShowTitle is false', async () => {
    // given
    mockSectionData.PageSectionID = 1234;
    mockSectionData.SectionTitle = 'Section Title';
    mockSectionData.ShowTitle = false;

    // when
    await act(async () => {
      render(
        <PageSection siteData={mockSiteData} sectionData={mockSectionData}/>
      );
    })

    // then
    const element = await screen.queryByText(/Section Title/i);
    expect(element).toBeNull();
  });

  it('should render text', async () => {
    // given
    mockSectionData.PageSectionID = 1234;
    mockSectionData.SectionText = 'Section text';
    mockSectionData.ShowText = true;

    // when
    await act(async () => {
      render(
        <PageSection siteData={mockSiteData} sectionData={mockSectionData}/>
      );
    })

    // then
    const element = await screen.findByText(/Section text/i);
    expect(element).toBeInTheDocument();
  });

  it('should hide text when ShowText is false', async () => {
    // given
    mockSectionData.PageSectionID = 1234;
    mockSectionData.SectionText = 'Section text';
    mockSectionData.ShowText = false;

    // when
    await act(async () => {
      render(
        <PageSection siteData={mockSiteData} sectionData={mockSectionData}/>
      );
    })

    // then
    const element = await screen.queryByText(/Section text/i);
    expect(element).toBeNull();
  });

  it('should render image centered', async () => {
    // given
    mockSectionData.PageSectionID = 1234;
    mockSectionData.SectionTitle = 'Section Title';
    mockSectionData.SectionImage = '/sectionimage.jpg';
    mockSectionData.ShowImage = true;
    mockSectionData.ImagePosition = 'above';
    mockSectionData.ImageAlign = 'center';

    // when
    await act(async () => {
      render(
        <PageSection siteData={mockSiteData} sectionData={mockSectionData}/>
      );
    })

    // then
    const element = await screen.findByTestId(/SectionImage-1234/i);
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute("alt", "Section Title");
    const div = await screen.findByTestId(/SectionImageDiv-1234/i);
    expect(div).toBeInTheDocument();
    expect(div).toHaveStyle({'display': 'flex', 'justify-content': 'center', 'align-items': 'center'});
  });

  it('should hide image when ShowImage is false', async () => {
    // given
    mockSectionData.PageSectionID = 1234;
    mockSectionData.SectionTitle = 'Section Title';
    mockSectionData.SectionImage = '/sectionimage.jpg';
    mockSectionData.ShowImage = false;

    // when
    await act(async () => {
      render(
        <PageSection siteData={mockSiteData} sectionData={mockSectionData}/>
      );
    })

    // then
    const element = await screen.queryByTestId(/SectionImage-1234/i);
    expect(element).toBeNull();
  });

  it('should remove image border when HideImageFrame is true', async () => {
    // given
    mockSectionData.PageSectionID = 1234;
    mockSectionData.SectionImage = '/sectionimage.jpg';
    mockSectionData.ShowImage = true;
    mockSectionData.HideImageFrame = true;

    // when
    await act(async () => {
      render(
        <PageSection siteData={mockSiteData} sectionData={mockSectionData}/>
      );
    })

    // then
    const element = await screen.findByTestId(/SectionImage-1234/i);
    expect(element).toBeInTheDocument();
    expect(element).toHaveStyle({'border': 'none', 'box-shadow': 'none'});
  });

  it('should align image beside text', async () => {
    // given
    mockSectionData.PageSectionID = 1234;
    mockSectionData.SectionImage = '/sectionimage.jpg';
    mockSectionData.ImagePosition = 'beside';
    mockSectionData.ImageAlign = 'left';
    mockSectionData.SectionText = 'Section text';
    mockSectionData.ShowImage = true;
    mockSectionData.ShowText = true;

    // when
    await act(async () => {
      render(
        <PageSection siteData={mockSiteData} sectionData={mockSectionData}/>
      );
    })

    // then
    const image = await screen.findByTestId(/SectionImage-1234/i);
    expect(image).toBeInTheDocument();
    const div = await screen.findByTestId(/SectionImageDiv-1234/i);
    expect(div).toBeInTheDocument();
    expect(div).toHaveStyle({'position': 'relative', 'float': 'left'});
  });

});